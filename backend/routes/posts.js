import express from "express";
import multer from "multer";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import {
  getEventPosts,
  createPost,
  createComment,
  toggleLike,
  deletePost,
} from "../controllers/posts.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files are allowed!"), false);
  },
});

// GET posts for an event (public)
router.get("/events/:eventId/posts", getEventPosts);

// Create post for an event (authenticated)
router.post(
  "/events/:eventId/posts",
  authenticateToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        if (err.message === "Only image files are allowed!") {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  createPost
);

// Comment on a post
router.post("/posts/:postId/comments", authenticateToken, createComment);

// Like/unlike a post
router.post("/posts/:postId/like", authenticateToken, toggleLike);

// Delete post (manager who owns event or admin)
router.delete("/posts/:postId", authenticateToken, requireRole(["MANAGER", "ADMIN"]), deletePost);

export default router;
