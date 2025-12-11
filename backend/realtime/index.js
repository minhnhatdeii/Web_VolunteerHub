import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient as createRedisClient } from 'redis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import prisma from '../db.js';

let ioInstance = null;
let eventNamespace = null;
let supabaseRealtime = null;
let redisClients = { pub: null, sub: null };
const supabaseChannels = [];

const fallbackPollingMs = parseInt(process.env.REALTIME_FALLBACK_INTERVAL_MS || '10000', 10);
const realtimeState = {
  supabaseConfigured: false,
  supabaseConnected: false,
  redisAdapter: false,
  fallbackPollingMs
};

/**
 * Initialize Socket.io and Supabase realtime bridge
 * @param {import('http').Server} httpServer
 */
export async function initRealtime(httpServer) {
  ioInstance = new Server(httpServer, {
    path: process.env.WS_PATH || '/socket.io',
    cors: {
      origin: process.env.WS_CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  setupNamespaces();
  await setupRedisAdapter();
  await setupSupabaseBridge();

  return ioInstance;
}

export function getRealtimeStatus() {
  return { ...realtimeState };
}

export async function shutdownRealtime() {
  if (supabaseRealtime) {
    for (const channel of supabaseChannels) {
      await supabaseRealtime.removeChannel(channel);
    }
    await supabaseRealtime.removeAllChannels();
    supabaseRealtime = null;
  }

  if (redisClients.pub) {
    try {
      await redisClients.pub.quit();
    } catch (err) {
      console.warn('Failed to close Redis pub client:', err?.message);
    }
  }
  if (redisClients.sub) {
    try {
      await redisClients.sub.quit();
    } catch (err) {
      console.warn('Failed to close Redis sub client:', err?.message);
    }
  }
  redisClients = { pub: null, sub: null };

  if (ioInstance) {
    await new Promise((resolve) => ioInstance.close(resolve));
    ioInstance = null;
  }
}

function setupNamespaces() {
  if (!ioInstance) return;

  // Default namespace (health ping)
  ioInstance.on('connection', (socket) => {
    socket.emit('realtime:ready', buildReadyPayload());
  });

  // Dynamic namespace for each event: /events/<eventId>
  eventNamespace = ioInstance.of(/^\/events\/.+$/);
  eventNamespace.on('connection', (socket) => {
    const [, , eventId] = socket.nsp.name.split('/');
    if (!eventId) {
      socket.emit('realtime:error', { message: 'Invalid event namespace' });
      return socket.disconnect(true);
    }

    const roomName = eventRoom(eventId);
    socket.join(roomName);
    socket.emit('realtime:ready', buildReadyPayload(eventId));
  });
}

async function setupRedisAdapter() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return;
  }

  try {
    const pubClient = createRedisClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();

    ioInstance.adapter(createAdapter(pubClient, subClient));
    redisClients = { pub: pubClient, sub: subClient };
    realtimeState.redisAdapter = true;
    console.log('Socket.io Redis adapter enabled');
  } catch (err) {
    console.warn('Redis adapter not enabled:', err?.message);
  }
}

async function setupSupabaseBridge() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase realtime disabled: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY');
    return;
  }

  supabaseRealtime = createSupabaseClient(supabaseUrl, supabaseKey);
  realtimeState.supabaseConfigured = true;

  await subscribeToTable('events', handleEventChange);
  await subscribeToTable('posts', handlePostChange);
  await subscribeToTable('comments', handleCommentChange);
}

async function subscribeToTable(table, handler) {
  if (!supabaseRealtime) return;

  const channel = supabaseRealtime
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => Promise.resolve(handler(payload)).catch((err) => {
        console.warn(`Realtime handler error for ${table}:`, err?.message);
      })
    );

  const subscription = await channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      realtimeState.supabaseConnected = true;
      console.log(`Supabase realtime subscribed to ${table}`);
    } else if (status === 'CHANNEL_ERROR') {
      realtimeState.supabaseConnected = false;
      console.warn(`Supabase realtime channel error on ${table}`);
    }
  });

  supabaseChannels.push(subscription);
}

function emitToEvent(eventId, eventName, payload) {
  if (!eventNamespace || !eventId) return;
  eventNamespace.to(eventRoom(eventId)).emit(eventName, payload);
}

function eventRoom(eventId) {
  return `event:${eventId}`;
}

function buildReadyPayload(eventId) {
  return {
    eventId,
    supabase: realtimeState.supabaseConfigured,
    supabaseConnected: realtimeState.supabaseConnected,
    redisAdapter: realtimeState.redisAdapter,
    fallback: { polling: true, intervalMs: realtimeState.fallbackPollingMs }
  };
}

function handleEventChange(payload) {
  const eventId = payload.new?.id || payload.old?.id;
  const body = {
    type: payload.eventType,
    eventId,
    event: payload.new || payload.old
  };
  emitToEvent(eventId, 'event:update', body);
  ioInstance?.emit('events:refresh', { eventId, type: payload.eventType });
}

/**
 * Manual emitter for controllers to push event updates without waiting on Supabase
 * @param {Object} event
 * @param {string} type
 */
export function emitEventUpdate(event, type = 'manual') {
  const eventId = event?.id;
  if (!eventId || !ioInstance) return;

  const body = { type, eventId, event };
  emitToEvent(eventId, 'event:update', body);
  ioInstance.emit('events:refresh', { eventId, type });
}

function handlePostChange(payload) {
  const post = payload.new || payload.old;
  const eventId = post?.eventId;
  const body = {
    type: payload.eventType,
    eventId,
    post
  };
  if (eventId) {
    emitToEvent(eventId, 'post:update', body);
  }
  ioInstance?.emit('posts:refresh', body);
}

/**
 * Manual emitter for post updates (when not relying solely on Supabase realtime)
 * @param {Object} post
 * @param {string} type
 */
export function emitPostUpdate(post, type = 'manual') {
  if (!post?.eventId || !ioInstance) return;
  const body = { type, eventId: post.eventId, post };
  emitToEvent(post.eventId, 'post:update', body);
  ioInstance.emit('posts:refresh', body);
}

async function handleCommentChange(payload) {
  const comment = payload.new || payload.old;
  const postId = comment?.postId;
  let eventId = comment?.eventId;

  if (!eventId && postId) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { eventId: true }
      });
      eventId = post?.eventId;
    } catch (err) {
      console.warn('Failed to resolve eventId for comment:', err?.message);
    }
  }

  const body = {
    type: payload.eventType,
    eventId,
    postId,
    comment
  };

  if (eventId) {
    emitToEvent(eventId, 'comment:update', body);
  }
  ioInstance?.emit('comments:refresh', body);
}

/**
 * Manual emitter for comment updates
 * @param {Object} comment
 * @param {string} postId
 * @param {string} eventId
 * @param {string} type
 */
export function emitCommentUpdate(comment, postId, eventId, type = 'manual') {
  const body = { type, eventId, postId, comment };
  if (eventId) {
    emitToEvent(eventId, 'comment:update', body);
  }
  ioInstance?.emit('comments:refresh', body);
}

export default {
  initRealtime,
  getRealtimeStatus,
  emitEventUpdate,
  emitPostUpdate,
  emitCommentUpdate,
  shutdownRealtime
};
