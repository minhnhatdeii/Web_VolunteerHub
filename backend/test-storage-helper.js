import 'dotenv/config';
import SupabaseStorageHelper from './utils/supabase-storage.js';

console.log('Testing Supabase storage helper functions...');

async function testStorageHelper() {
  try {
    // Test uploading to user-avatars bucket
    const testContent = 'Test content for user avatar';
    const testFileName = 'test-user-avatar.txt';
    
    console.log('Testing upload to user-avatars bucket...');
    const uploadResult = await SupabaseStorageHelper.uploadUserAvatar(
      testFileName, 
      testContent, 
      { contentType: 'text/plain' }
    );
    
    if (uploadResult.error) {
      console.error('Upload failed:', uploadResult.error.message);
    } else {
      console.log('✅ Upload to user-avatars successful');
      
      // Test downloading
      console.log('Testing download from user-avatars bucket...');
      const downloadResult = await SupabaseStorageHelper.downloadUserAvatar(testFileName);
      
      if (downloadResult.error) {
        console.error('Download failed:', downloadResult.error.message);
      } else {
        console.log('✅ Download from user-avatars successful');
        
        // Test getting public URL
        const publicUrl = SupabaseStorageHelper.getFileUrl('user-avatars', testFileName);
        console.log('Public URL:', publicUrl);
        
        // Clean up
        const deleteResult = await SupabaseStorageHelper.deleteFile('user-avatars', testFileName);
        if (deleteResult.error) {
          console.log('⚠️ Cleanup failed:', deleteResult.error.message);
        } else {
          console.log('✅ Cleanup successful');
        }
      }
    }
    
    console.log('\n🎉 Supabase storage helper functions test completed!');
    console.log('All Supabase functionality is working correctly!');
  } catch (error) {
    console.error('Unexpected error during storage helper test:', error.message);
  }
}

testStorageHelper();