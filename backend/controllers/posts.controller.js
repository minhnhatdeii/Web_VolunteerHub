import prisma from '../db.js';
import SupabaseStorageHelper from '../utils/supabase-storage.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { emitPostUpdate, emitCommentUpdate } from '../realtime/index.js';

const VALID_EVENT_STATUSES = ['APPROVED', 'COMPLETED'];

const postInclude = {
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: {
      comments: true,
      likes: true,
    },
  },
};

export async function getEventPosts(req, res) {
  try {
    const { eventId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 50);
    const cursor = req.query.cursor;

    const baseQuery = {
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: postInclude,
    };

    if (cursor) {
      baseQuery.cursor = { id: cursor };
      baseQuery.skip = 1;
    }

    const posts = await prisma.post.findMany(baseQuery);
    let nextCursor = null;
    if (posts.length > limit) {
      const next = posts.pop();
      nextCursor = next?.id || null;
    }

    return res.json({
      success: true,
      data: {
        items: posts,
        nextCursor,
      },
      message: null,
    });
  } catch (err) {
    console.error('Failed to get posts:', err);
    return res.status(500).json({ success: false, data: null, message: 'Failed to load posts' });
  }
}

export async function createPost(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;
    const content = sanitizeContent(req.body.content || '');
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!content && !file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Content or image is required',
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) {
      return res.status(404).json({ success: false, data: null, message: 'Event not found' });
    }

    if (!VALID_EVENT_STATUSES.includes(event.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Event not approved for posting',
      });
    }

    let imageUrl = null;
    if (file) {
      const fileName = `posts/${eventId}/${Date.now()}-${file.originalname}`;
      const uploadResult = await SupabaseStorageHelper.uploadPostImage(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      if (uploadResult.error) {
        console.error('Supabase upload error:', uploadResult.error?.message);
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to upload image',
        });
      }

      imageUrl = SupabaseStorageHelper.getFileUrl('post-images', uploadResult.data.path);
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: userId,
        eventId,
      },
      include: postInclude,
    });

    emitPostUpdate(post, 'CREATED');

    return res.status(201).json({ success: true, data: post, message: null });
  } catch (err) {
    console.error('Failed to create post:', err);
    return res.status(500).json({ success: false, data: null, message: 'Failed to create post' });
  }
}

export async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const content = sanitizeContent(req.body.content || '');

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    if (!content) {
      return res.status(400).json({ success: false, data: null, message: 'Content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, eventId: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    emitCommentUpdate(comment, postId, post.eventId, 'CREATED');

    return res.status(201).json({ success: true, data: comment, message: null });
  } catch (err) {
    console.error('Failed to create comment:', err);
    return res.status(500).json({ success: false, data: null, message: 'Failed to create comment' });
  }
}

export async function toggleLike(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, eventId: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let liked = false;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { userId, postId } });
      liked = true;
    }

    const likesCount = await prisma.like.count({ where: { postId } });
    emitPostUpdate({ ...post, likesCount }, liked ? 'LIKE' : 'UNLIKE');

    return res.json({ success: true, data: { liked, likesCount }, message: null });
  } catch (err) {
    console.error('Failed to toggle like:', err);
    return res.status(500).json({ success: false, data: null, message: 'Failed to toggle like' });
  }
}

export async function deletePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
        authorId: true,
        event: { select: { creatorId: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    }

    const isOwner = post.event?.creatorId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden' });
    }

    await prisma.post.delete({ where: { id: postId } });
    emitPostUpdate({ id: postId, eventId: post.eventId }, 'DELETED');

    return res.json({ success: true, data: null, message: 'Post deleted' });
  } catch (err) {
    console.error('Failed to delete post:', err);
    return res.status(500).json({ success: false, data: null, message: 'Failed to delete post' });
  }
}

export default {
  getEventPosts,
  createPost,
  createComment,
  toggleLike,
  deletePost,
};
