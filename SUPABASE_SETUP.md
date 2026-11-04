# ReelStudio — Supabase backend setup

This work changes only adeelraja-prog/reelstudio.

## Added in this milestone
- Database tables for profiles, one brand per user, connected social accounts, media assets, scheduled posts, per-account publishing status, and logs.
- Row Level Security policies for user-owned records.
- OAuth token fields are in a private table with no authenticated-client policies.
- A database trigger creates a profile and default brand after sign-up.

## Apply the database
1. Create a Supabase project: https://supabase.com/dashboard
2. Open SQL Editor and create a new query.
3. Copy all SQL from supabase/migrations/202611040001_initial_schema.sql into the editor and run it.
4. In Authentication > Providers > Google, enable Google sign-in and enter your Google OAuth client details.
5. In Authentication > URL Configuration, add your deployed ReelStudio URL and local development URL to allowed redirect URLs.

Never commit the Supabase service-role key, Google client secret, Meta app secret, or OAuth tokens. The service-role key must only be used by trusted server-side Edge Functions.

## Not connected yet
This migration does not create your Supabase project, enable Google for your account, connect Facebook/Instagram/YouTube, upload media to cloud storage, or publish posts. Those require your project credentials and platform authorization.

## Next engineering milestone
Add the Supabase browser client using only the public project URL and anon key, implement Google sign-in/session handling, then build server-side OAuth callbacks, encrypted token storage, private media uploads, and a scheduled publishing worker.

The existing local queue is not automatically migrated. A deliberate import/upload feature will be added so locally queued video files are not lost or uploaded without your approval.
