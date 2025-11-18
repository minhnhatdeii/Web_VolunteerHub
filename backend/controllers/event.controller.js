import { PrismaClient } from '../generated/prisma/index.js';
import { z } from 'zod';
import { ZodError } from "zod";
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().min(3),
  category: z.string(),
  maxParticipants: z.number(),
  thumbnailUrl: z.string().optional(),
});

/* -----------------------------------------------------------
   1. GET /api/events — list with filters (public)
------------------------------------------------------------*/
export const getEvents = async (req, res) => {
  try {
    const { status, category, location, q } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (q)
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];

    const events = await prisma.event.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/* -----------------------------------------------------------
   2. GET /api/events/:id — event detail (public)
------------------------------------------------------------*/
export const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        registrations: true,
      },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get event details' });
  }
};

/* -----------------------------------------------------------
   3. POST /api/events — create event (MANAGER only)
------------------------------------------------------------*/
export const createEvent = async (req, res) => {
  try {
    const parsed = eventSchema.parse(req.body);

    const event = await prisma.event.create({
      data: {
        ...parsed,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        creatorId: req.user.id, // creator là chính manager
      },
    });

    res.status(201).json(event);
  } catch (err) {
    
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.issues,   // 🔥 đúng thuộc tính
      });
    }

    console.error("Server error:", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

/* -----------------------------------------------------------
   4. PUT /api/events/:id — update event (owner only)
------------------------------------------------------------*/
export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Only the event owner can update' });
    }

    const parsed = eventSchema.partial().parse(req.body);
    const updated = await prisma.event.update({ where: { id }, data: parsed });

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

/* -----------------------------------------------------------
   5. DELETE /api/events/:id — delete event (owner only)
------------------------------------------------------------*/
export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the event owner or admin can delete' });
    }

    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

/* -----------------------------------------------------------
   6. POST /api/events/:id/submit — submit for approval (owner only)
------------------------------------------------------------*/
export const submitEventForApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Only the event owner can submit' });
    }

    if (event.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft events can be submitted' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    });

    res.json({ message: 'Event submitted for approval', event: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit event' });
  }
};

/* -----------------------------------------------------------
   7. POST /api/events/:id/approve — approve event (ADMIN only)
------------------------------------------------------------*/
export const approveEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ error: 'Only pending events can be approved' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    res.json({ message: 'Event approved', event: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve event' });
  }
};

/* -----------------------------------------------------------
   8. GET /api/managers/:id/events — events by manager (public)
------------------------------------------------------------*/
export const getManagerEvents = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const events = await prisma.event.findMany({
      where: { creatorId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ manager: user, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load manager events' });
  }
};

/* -----------------------------------------------------------
   9. POST /api/events/:id/upload-thumbnail — owner/admin only
------------------------------------------------------------*/
export const uploadEventThumbnail = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can upload thumbnail' });
    }

    const filePath = `events/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('event-thumbnails')
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const publicUrl = supabase.storage
      .from('event-thumbnails')
      .getPublicUrl(data.path).data.publicUrl;

    res.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Thumbnail upload failed' });
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
