import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Create a notification for a user
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.userId - The user ID to send the notification to
 * @param {string} notificationData.title - The title of the notification
 * @param {string} notificationData.message - The message of the notification
 * @param {string} notificationData.type - The type of the notification
 * @param {Object} [notificationData.data] - Additional data for the notification
 * @returns {Promise<Object>} The created notification
 */
export const createNotification = async ({ userId, title, message, type, data = null }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data ? data : undefined, // Only include data if it's provided
      },
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user ID to get notifications for
 * @param {Object} options - Options for filtering and pagination
 * @param {number} [options.limit=10] - Number of notifications to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {boolean} [options.unreadOnly=false] - Whether to return only unread notifications
 * @returns {Promise<Array>} List of notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  const { limit = 10, offset = 0, unreadOnly = false } = options;
  
  try {
    const where = {
      userId,
      ...(unreadOnly && { isRead: false })
    };
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID to mark as read
 * @param {string} userId - The user ID who owns the notification
 * @returns {Promise<Object>} The updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId, // Ensure the user owns the notification
      },
      data: {
        isRead: true,
      },
    });
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all user notifications as read
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Number of notifications updated
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};