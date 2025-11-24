import express from "express";
import multer from 'multer';
import EventController from "../controllers/event.controller.js";
import {
  authenticateToken,
  requireRole
} from "../middleware/auth.js";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as buffers
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// 1. GET /api/events  
router.get("/", EventController.getEvents);

// 2. GET /api/events/:id  
router.get("/:id", EventController.getEventById);

// Get manager events
router.get("/manager/:id/events", EventController.getManagerEvents);

// 3. POST /api/events  (Manager only)
router.post(
  "/",
  authenticateToken,
  requireRole("MANAGER"),
  (req, res, next) => {
    // Handle multer errors for image upload
    upload.single('thumbnail')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  EventController.createEvent
);

// 4. PUT /api/events/:id  (Manager only)
router.put(
  "/:id",
  authenticateToken,
  requireRole("MANAGER"),
  (req, res, next) => {
    // Handle multer errors for image upload
    upload.single('thumbnail')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  EventController.updateEvent
);

// 5. DELETE /api/events/:id  (Manager, Admin)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["MANAGER", "ADMIN"]),
  EventController.deleteEvent
);

// 6. POST /api/events/:id/submit (submit for approval)
router.post(
  "/:id/submit",
  authenticateToken,
  requireRole("MANAGER"),
  EventController.submitEventForApproval
);


// This route doesn't belong in events.js, it should be in a separate managers route file
// Commenting out for now - will be handled separately

// 9. Upload thumbnail → Supabase
router.post(
  "/:id/upload-thumbnail",
  authenticateToken,
  requireRole("MANAGER"),
  (req, res, next) => {
    // Handle multer errors
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  EventController.uploadEventThumbnail
);

export default router;


// import express from 'express';
// const router = express.Router();

// // Placeholder routes for event management (to be implemented in Milestone 4)
// router.get('/', (req, res) => {
//   res.status(501).json({ error: 'Get events endpoint not implemented yet' });
// });

// router.get('/:id', (req, res) => {
//   res.status(501).json({ error: 'Get event details endpoint not implemented yet' });
// });

// router.post('/', (req, res) => {
//   res.status(501).json({ error: 'Create event endpoint not implemented yet' });
// });

// router.put('/:id', (req, res) => {
//   res.status(501).json({ error: 'Edit event endpoint not implemented yet' });
// });

// router.delete('/:id', (req, res) => {
//   res.status(501).json({ error: 'Delete event endpoint not implemented yet' });
// });

// router.post('/:id/submit', (req, res) => {
//   res.status(501).json({ error: 'Event submission for approval endpoint not implemented yet' });
// });

// router.get('/:id/registrations', (req, res) => {
//   res.status(501).json({ error: 'Get event registrations endpoint not implemented yet' });
// });

// export default router;