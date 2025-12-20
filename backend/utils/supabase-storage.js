import { supabase } from '../config/supabase.js';

/**
 * Helper functions for Supabase storage operations
 */
class SupabaseStorageHelper {
  /**
   * Upload a file to the user avatars bucket
   * @param {string} fileName - Name of the file to upload
   * @param {File|Buffer} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} The upload result
   */
  static async uploadUserAvatar(fileName, file, options = {}) {
    return await supabase
      .storage
      .from('user-avatars')
      .upload(fileName, file, {
        contentType: options.contentType || 'image/jpeg',
        upsert: options.upsert || true,
        ...options
      });
  }

  /**
   * Download a file from the user avatars bucket
   * @param {string} fileName - Name of the file to download
   * @returns {Promise} The download result
   */
  static async downloadUserAvatar(fileName) {
    return await supabase
      .storage
      .from('user-avatars')
      .download(fileName);
  }

  /**
   * Upload a file to the event thumbnails bucket
   * @param {string} fileName - Name of the file to upload
   * @param {File|Buffer} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} The upload result
   */
  static async uploadEventThumbnail(fileName, file, options = {}) {
    return await supabase
      .storage
      .from('event-thumbnails')
      .upload(fileName, file, {
        contentType: options.contentType || 'image/jpeg',
        upsert: options.upsert || true,
        ...options
      });
  }

  /**
   * Download a file from the event thumbnails bucket
   * @param {string} fileName - Name of the file to download
   * @returns {Promise} The download result
   */
  static async downloadEventThumbnail(fileName) {
    return await supabase
      .storage
      .from('event-thumbnails')
      .download(fileName);
  }

  /**
   * Upload a file to the post images bucket
   * @param {string} fileName - Name of the file to upload
   * @param {File|Buffer} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} The upload result
   */
  static async uploadPostImage(fileName, file, options = {}) {
    return await supabase
      .storage
      .from('post-images')
      .upload(fileName, file, {
        contentType: options.contentType || 'image/jpeg',
        upsert: options.upsert || true,
        ...options
      });
  }

  /**
   * Download a file from the post images bucket
   * @param {string} fileName - Name of the file to download
   * @returns {Promise} The download result
   */
  static async downloadPostImage(fileName) {
    return await supabase
      .storage
      .from('post-images')
      .download(fileName);
  }

  /**
   * Upload a file to the comment images bucket
   * @param {string} fileName - Name of the file to upload
   * @param {File|Buffer} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} The upload result
   */
  static async uploadCommentImage(fileName, file, options = {}) {
    return await supabase
      .storage
      .from('image-comments')
      .upload(fileName, file, {
        contentType: options.contentType || 'image/jpeg',
        upsert: options.upsert || true,
        ...options
      });
  }

  /**
   * Download a file from the comment images bucket
   * @param {string} fileName - Name of the file to download
   * @returns {Promise} The download result
   */
  static async downloadCommentImage(fileName) {
    return await supabase
      .storage
      .from('image-comments')
      .download(fileName);
  }

  /**
   * Delete a file from any bucket
   * @param {string} bucketName - Name of the bucket
   * @param {string} fileName - Name of the file to delete
   * @returns {Promise} The deletion result
   */
  static async deleteFile(bucketName, fileName) {
    return await supabase
      .storage
      .from(bucketName)
      .remove([fileName]);
  }

  /**
   * Get the public URL for a file
   * @param {string} bucketName - Name of the bucket
   * @param {string} fileName - Name of the file
   * @returns {string} The public URL
   */
  static getFileUrl(bucketName, fileName) {
    const { data } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);
    return data?.publicUrl;
  }
}

export default SupabaseStorageHelper;