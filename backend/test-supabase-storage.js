import 'dotenv/config';
import { supabase } from './config/supabase.js';

console.log('Running comprehensive Supabase storage test...');

async function testStorageBuckets() {
  try {
    // First, let's list all buckets to confirm they exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('Available buckets:', buckets.map(bucket => bucket.name));
    
    // Check if our buckets exist
    const bucketNames = buckets.map(bucket => bucket.name);
    const requiredBuckets = ['user_avatars', 'event_thumbnails', 'post_images'];
    
    requiredBuckets.forEach(bucketName => {
      if (bucketNames.includes(bucketName)) {
        console.log(`✅ ${bucketName} bucket exists`);
      } else {
        console.log(`❌ ${bucketName} bucket NOT FOUND`);
      }
    });
    
    // Test uploading a small file to each bucket to verify policies
    const testContent = 'Test file for policy verification';
    const testFileName = 'test-policy-file.txt';
    
    for (const bucketName of requiredBuckets) {
      console.log(`\nTesting ${bucketName} bucket...`);
      
      // Try to upload a test file
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.log(`❌ Upload to ${bucketName} failed:`, error.message);
        
        // Try to list files in the bucket to see if we have read access
        const { data: listData, error: listError } = await supabase
          .storage
          .from(bucketName)
          .list('', { limit: 5 });
        
        if (listError) {
          console.log(`❌ List from ${bucketName} failed:`, listError.message);
        } else {
          console.log(`✅ List from ${bucketName} successful, found ${listData?.length || 0} files`);
        }
      } else {
        console.log(`✅ Upload to ${bucketName} successful`);
        
        // Try to download the file to verify read access
        const { data: downloadData, error: downloadError } = await supabase
          .storage
          .from(bucketName)
          .download(testFileName);
        
        if (downloadError) {
          console.log(`⚠️ Download from ${bucketName} failed:`, downloadError.message);
        } else {
          console.log(`✅ Download from ${bucketName} successful`);
        }
        
        // Clean up: delete the test file
        const { error: deleteError } = await supabase
          .storage
          .from(bucketName)
          .remove([testFileName]);
          
        if (deleteError) {
          console.log(`⚠️ Cleanup failed for ${bucketName}:`, deleteError.message);
        } else {
          console.log(`✅ Cleanup for ${bucketName} successful`);
        }
      }
    }
    
    console.log('\n🎉 Comprehensive Supabase storage test completed!');
    
  } catch (error) {
    console.error('Unexpected error during storage test:', error.message);
  }
}

testStorageBuckets();