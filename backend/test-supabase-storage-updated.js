import 'dotenv/config';
import { supabase } from './config/supabase.js';

console.log('Running comprehensive Supabase storage test with correct bucket names...');

async function testStorageBuckets() {
  try {
    // First, let's list all buckets to confirm they exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('Available buckets:', buckets.map(bucket => bucket.name));
    
    // Check if our buckets exist (with hyphens instead of underscores)
    const bucketNames = buckets.map(bucket => bucket.name);
    const requiredBucketsMap = {
      'user-avatars': 'user_avatars',
      'event-thumbnails': 'event_thumbnails', 
      'post-images': 'post_images'
    };
    
    Object.keys(requiredBucketsMap).forEach(bucketName => {
      if (bucketNames.includes(bucketName)) {
        console.log(`✅ ${bucketName} bucket exists`);
      } else {
        console.log(`❌ ${bucketName} bucket NOT FOUND`);
      }
    });
    
    // Test uploading a small file to each bucket to verify policies
    const testContent = 'Test file for policy verification';
    const testFileName = 'test-policy-file.txt';
    
    for (const [actualBucketName, logicalBucketName] of Object.entries(requiredBucketsMap)) {
      console.log(`\nTesting ${actualBucketName} (${logicalBucketName}) bucket...`);
      
      // Try to upload a test file
      const { data, error } = await supabase
        .storage
        .from(actualBucketName)
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.log(`❌ Upload to ${actualBucketName} failed:`, error.message);
        
        // Try to list files in the bucket to see if we have read access
        const { data: listData, error: listError } = await supabase
          .storage
          .from(actualBucketName)
          .list('', { limit: 5 });
        
        if (listError) {
          console.log(`❌ List from ${actualBucketName} failed:`, listError.message);
        } else {
          console.log(`✅ List from ${actualBucketName} successful, found ${listData?.length || 0} files`);
        }
      } else {
        console.log(`✅ Upload to ${actualBucketName} successful`);
        
        // Try to download the file to verify read access
        const { data: downloadData, error: downloadError } = await supabase
          .storage
          .from(actualBucketName)
          .download(testFileName);
        
        if (downloadError) {
          console.log(`⚠️ Download from ${actualBucketName} failed:`, downloadError.message);
        } else {
          console.log(`✅ Download from ${actualBucketName} successful`);
        }
        
        // Clean up: delete the test file
        const { error: deleteError } = await supabase
          .storage
          .from(actualBucketName)
          .remove([testFileName]);
          
        if (deleteError) {
          console.log(`⚠️ Cleanup failed for ${actualBucketName}:`, deleteError.message);
        } else {
          console.log(`✅ Cleanup for ${actualBucketName} successful`);
        }
      }
    }
    
    console.log('\n🎉 Comprehensive Supabase storage test completed!');
    console.log('Note: In your application code, use the actual bucket names (with hyphens):');
    console.log('- user-avatars (not user_avatars)');
    console.log('- event-thumbnails (not event_thumbnails)');
    console.log('- post-images (not post_images)');
    
  } catch (error) {
    console.error('Unexpected error during storage test:', error.message);
  }
}

testStorageBuckets();