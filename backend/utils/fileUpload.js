const { supabase } = require('../config/supabase');

/**
 * Upload a file to Supabase storage
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name to give the file
 * @param {string} bucketName - The Supabase storage bucket name
 * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Result of the upload
 */
const uploadFile = async (fileBuffer, fileName, bucketName) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: publicUrlData.publicUrl
      }
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a file from Supabase storage
 * @param {string} fileName - The name of the file to delete
 * @param {string} bucketName - The Supabase storage bucket name
 * @returns {Promise<{success: boolean, error?: any}>} - Result of the deletion
 */
const deleteFile = async (fileName, bucketName) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadFile,
  deleteFile
};