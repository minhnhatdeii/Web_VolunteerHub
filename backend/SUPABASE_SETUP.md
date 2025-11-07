# Supabase Configuration for VolunteerHub

## Connection Status
✅ Supabase connection is working correctly

## Bucket Configuration
Your application has 3 storage buckets set up with appropriate policies:

### 1. User Avatars Bucket
- **Actual Bucket Name:** `user-avatars`
- **Purpose:** Store user profile avatars
- **Policy:** Authenticated users can upload, read, update, and delete their own files
- **File Naming Convention:** Files should be named with user ID (e.g., `{user_id}_avatar.jpg`)

### 2. Event Thumbnails Bucket
- **Actual Bucket Name:** `event-thumbnails`
- **Purpose:** Store event thumbnail images
- **Policy:** Authenticated users can upload, read, update, and delete their own files
- **File Naming Convention:** Files should be named with event ID (e.g., `{event_id}_thumbnail.jpg`)

### 3. Post Images Bucket
- **Actual Bucket Name:** `post-images`
- **Purpose:** Store images uploaded in posts
- **Policy:** Authenticated users can upload, read, update, and delete their own files
- **File Naming Convention:** Files should be named with post ID or user ID prefix (e.g., `{post_id}_image.jpg`)

## Important Notes
1. **Bucket Names:** Use hyphens, not underscores in your bucket names when coding:
   - Use `user-avatars` (not `user_avatars`)
   - Use `event-thumbnails` (not `event_thumbnails`)
   - Use `post-images` (not `post_images`)

2. **Implementation Example:**
   ```javascript
   import { supabase } from './config/supabase.js';

   // Upload a user avatar
   const { data, error } = await supabase
     .storage
     .from('user-avatars')  // Note hyphen
     .upload('user_123_avatar.jpg', file, {
       contentType: 'image/jpeg'
     });

   // Download a user avatar
   const { data, error } = await supabase
     .storage
     .from('user-avatars')  // Note hyphen
     .download('user_123_avatar.jpg');
   ```

3. **Security Policy:** Each policy ensures users can only access files they uploaded by using the `owner = auth.uid()` condition.

## Environment Variables
Your `.env` file contains the necessary configuration:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: For client-side operations
- `SUPABASE_SERVICE_ROLE_KEY`: For admin/server-side operations (used in this backend)

## Testing
Both connection and storage functionality have been tested successfully.