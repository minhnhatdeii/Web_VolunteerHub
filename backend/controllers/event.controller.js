import { PrismaClient } from '../generated/prisma/index.js';
import { z } from 'zod';
import { ZodError } from "zod";
import { createClient } from '@supabase/supabase-js';
import { emitEventUpdate } from '../realtime/index.js';
import { createNotification } from '../services/notification.service.js';

const prisma = new PrismaClient();

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Validate that required environment variables are present
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  startDate: z.string().datetime({ message: 'Start date must be a valid datetime' }),
  endDate: z.string().datetime({ message: 'End date must be a valid datetime' }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
  thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL').optional().or(z.literal('')),
}).refine((data) => {
  // Validate that endDate is after startDate
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      return false;
    }
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"], // path of error
});

// Schema for creating events (without thumbnailUrl validation since it's handled via file upload)
const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  startDate: z.string().datetime({ message: 'Start date must be a valid datetime' }),
  endDate: z.string().datetime({ message: 'End date must be a valid datetime' }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
  thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL').optional().or(z.literal('')),
}).refine((data) => {
  // Validate that endDate is after startDate
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      return false;
    }
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"], // path of error
});

/* -----------------------------------------------------------
   1. GET /api/events — list with filters (public)
------------------------------------------------------------*/
export const getEvents = async (req, res) => {
  try {
    const { status, category, location, q, search } = req.query; // Added search parameter
    const where = {};

    // For public users, don't return draft or rejected events by default
    // This ensures consistency with getEventById access control
    // Only allow explicit filtering for DRAFT/REJECTED if provided in status parameter
    if (!status) {
      where.status = { notIn: ['DRAFT', 'REJECTED'] };
    } else {
      where.status = status;
    }

    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    // Use 'q' if provided, otherwise fall back to 'search' parameter
    const searchTerm = q || search;
    if (searchTerm)
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];

    const events = await prisma.event.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: events,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch events'
    });
  }
};

/* -----------------------------------------------------------
   2. GET /api/events/:id — event detail (public)
------------------------------------------------------------*/
export const getEventById = async (req, res) => {
  try {
    // Check if user is authenticated
    const userId = req.user?.id; // This might be undefined if not authenticated

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        registrations: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    // For public users (unauthenticated) viewing events:
    // Do not return draft or rejected events
    // But if the user is authenticated and is the event creator, allow them to see their own events regardless of status
    if (['DRAFT', 'REJECTED'].includes(event.status)) {
      if (!userId || event.creatorId !== userId) {
        // User is not authenticated or is not the event creator
        // Only allow access to non-draft and non-rejected events
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found'
        });
      }
    }

    res.json({
      success: true,
      data: event,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to get event details'
    });
  }
};

/* -----------------------------------------------------------
   3. POST /api/events — create event (MANAGER only)
------------------------------------------------------------*/
export const createEvent = async (req, res) => {
  try {
    // Check if there's a file upload in the request
    const file = req.file;
    let thumbnailUrl = null;

    // If there's an uploaded file, process it and upload to Supabase
    if (file) {
      const filePath = `events/${Date.now()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from('event-thumbnails')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false // Don't overwrite existing files
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to upload image to storage'
        });
      }

      const publicUrlResult = supabase.storage
        .from('event-thumbnails')
        .getPublicUrl(data.path).data;

      if (!publicUrlResult || !publicUrlResult.publicUrl) {
        console.error('Failed to get public URL for uploaded image');
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to get public URL for image'
        });
      }

      thumbnailUrl = publicUrlResult.publicUrl;
    }

    // Parse the request body for event data, excluding thumbnailUrl to prevent conflicts with file upload
    // Need to handle maxParticipants as it comes as a string from FormData
    const parsed = eventSchema.omit({ thumbnailUrl: true }).parse({
      ...req.body,
      maxParticipants: parseInt(req.body.maxParticipants, 10) || 0
    });

    // Prioritize the uploaded file URL over any thumbnailUrl in the request body
    const finalThumbnailUrl = thumbnailUrl || null;

    const event = await prisma.event.create({
      data: {
        ...parsed,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        creatorId: req.user.id, // creator là chính manager
        status: 'PENDING_APPROVAL', // Set to PENDING_APPROVAL when created by manager
        thumbnailUrl: finalThumbnailUrl
      },
    });

    // Notify all admins about the new event pending approval
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'Sự kiện mới chờ duyệt',
        message: `Sự kiện "${event.title}" đã được tạo và đang chờ phê duyệt.`,
        type: 'event_submitted',
        data: {
          eventId: event.id,
          eventTitle: event.title
        }
      });
    }

    res.status(201).json({
      success: true,
      data: event,
      message: null
    });
  } catch (err) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Validation failed"
      });
    }

    console.error("Server error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to create event"
    });
  }
};

/* -----------------------------------------------------------
   4. PUT /api/events/:id — update event (owner only)
------------------------------------------------------------*/
export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only the event owner can update'
      });
    }

    // Prevent editing if the event has already been approved or rejected
    if (event.status === 'APPROVED' || event.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot edit event once it has been approved or rejected'
      });
    }

    // Check if there's a file upload in the request
    const file = req.file;
    let thumbnailUrl = null;

    // If there's an uploaded file, process it and upload to Supabase
    if (file) {
      const filePath = `events/${Date.now()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from('event-thumbnails')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false // Don't overwrite existing files
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to upload image to storage'
        });
      }

      const publicUrlResult = supabase.storage
        .from('event-thumbnails')
        .getPublicUrl(data.path).data;

      if (!publicUrlResult || !publicUrlResult.publicUrl) {
        console.error('Failed to get public URL for uploaded image');
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to get public URL for image'
        });
      }

      thumbnailUrl = publicUrlResult.publicUrl;
    }

    // Parse the request body for event data, excluding thumbnailUrl to prevent conflicts with file upload
    // Need to handle maxParticipants as it comes as a string from FormData
    const parsed = eventSchema.partial().omit({ thumbnailUrl: true }).parse({
      ...req.body,
      maxParticipants: req.body.maxParticipants ? parseInt(req.body.maxParticipants, 10) || 0 : undefined
    });

    // Prepare the update data
    const updateData = {
      ...parsed,
    };

    // If a new file was uploaded, update the thumbnail URL
    if (thumbnailUrl !== null) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
    // If no file was uploaded but thumbnailUrl was provided in the request body, use that
    else if (req.body.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = req.body.thumbnailUrl;
    }

    const updated = await prisma.event.update({ where: { id }, data: updateData });

    res.json({
      success: true,
      data: updated,
      message: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed'
      });
    }
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to update event'
    });
  }
};

/* -----------------------------------------------------------
   5. DELETE /api/events/:id — delete event (owner only)
------------------------------------------------------------*/
export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    if (event.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only the event owner or admin can delete'
      });
    }

    await prisma.event.delete({ where: { id } });
    res.json({
      success: true,
      data: null,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to delete event'
    });
  }
};

/* -----------------------------------------------------------
   6. POST /api/events/:id/submit — submit for approval (owner only)
------------------------------------------------------------*/
export const submitEventForApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only the event owner can submit'
      });
    }

    // If the event is already in pending approval status, just return success
    if (event.status === 'PENDING_APPROVAL') {
      return res.json({
        success: true,
        data: event,
        message: 'Event is already pending approval'
      });
    }

    // Only allow submitting events that are currently in draft status
    if (event.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Event must be in draft status to submit for approval'
      });
    }

    // Update the event status to pending approval
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' }
    });

    // Notify all admins about the event submission
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'Sự kiện chờ duyệt',
        message: `Sự kiện "${event.title}" đã được gửi để phê duyệt.`,
        type: 'event_submitted',
        data: {
          eventId: event.id,
          eventTitle: event.title
        }
      });
    }

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event submitted for approval'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to submit event'
    });
  }
};

/* -----------------------------------------------------------
   7. POST /api/events/:id/approve — approve event (ADMIN only)
------------------------------------------------------------*/
export const approveEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Only pending events can be approved'
      });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    emitEventUpdate(updated, 'APPROVED');

    res.json({
      success: true,
      data: updated,
      message: 'Event approved'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to approve event'
    });
  }
};

/* -----------------------------------------------------------
   8. GET /api/managers/:id/events — events by manager (public)
------------------------------------------------------------*/
export const getManagerEvents = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    const events = await prisma.event.findMany({
      where: { creatorId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: events,
      message: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to load manager events'
    });
  }
};

/* -----------------------------------------------------------
   9. POST /api/events/:id/upload-thumbnail — owner/admin only
------------------------------------------------------------*/
export const uploadEventThumbnail = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'No file uploaded'
      });
    }

    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found'
      });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only owner can upload thumbnail'
      });
    }

    const filePath = `events/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('event-thumbnails')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to upload image to storage'
      });
    }

    const publicUrlResult = supabase.storage
      .from('event-thumbnails')
      .getPublicUrl(data.path).data;

    if (!publicUrlResult || !publicUrlResult.publicUrl) {
      console.error('Failed to get public URL for uploaded image');
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to get public URL for image'
      });
    }

    const publicUrl = publicUrlResult.publicUrl;

    // Update the event record with the thumbnail URL
    const updatedEvent = await prisma.event.update({
      where: { id: req.params.id },
      data: { thumbnailUrl: publicUrl }
    });

    res.json({
      success: true,
      data: { url: publicUrl, event: updatedEvent },
      message: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Thumbnail upload failed'
    });
  }
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  approveEvent,
  getManagerEvents,
  uploadEventThumbnail,
};
