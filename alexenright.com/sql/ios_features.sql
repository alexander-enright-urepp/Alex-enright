-- ============================================
-- iOS APP FEATURES - SQL SCHEMA ADDITIONS
-- ============================================

-- 1. Device Tokens for Push Notifications
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add image_url to community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Anonymous';

-- 3. Storage Bucket for Community Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community', 'community', TRUE)
ON CONFLICT DO NOTHING;

-- 4. Notification History (track what was sent)
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES daily_posts(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Device Tokens
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can register a device token
CREATE POLICY "Public can insert device_tokens"
ON device_tokens FOR INSERT WITH CHECK (true);

-- Only service role can view tokens (for sending notifications)
CREATE POLICY "Service can view device_tokens"
ON device_tokens FOR SELECT USING (true);

-- Device tokens can be updated (last_used_at)
CREATE POLICY "Public can update device_tokens"
ON device_tokens FOR UPDATE USING (true);

-- Notification History
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view notification history
CREATE POLICY "Only admins can view notification_history"
ON notification_history FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Only service/admins can insert notification records
CREATE POLICY "Only service can insert notification_history"
ON notification_history FOR INSERT WITH CHECK (true);

-- Storage Bucket Policies for Community Images
CREATE POLICY "Public can upload to community bucket"
ON storage.objects FOR INSERT TO PUBLIC WITH CHECK (
  bucket_id = 'community'
);

CREATE POLICY "Public can read from community bucket"
ON storage.objects FOR SELECT USING (
  bucket_id = 'community'
);

-- Update community_posts policies to allow public insert with image
DROP POLICY IF EXISTS "Public can insert community_posts" ON community_posts;
CREATE POLICY "Public can insert community_posts"
ON community_posts FOR INSERT WITH CHECK (true);

-- ============================================
-- API FUNCTIONS (for push notifications)
-- ============================================

-- Function to get all active device tokens
-- Usage: SELECT * FROM get_active_device_tokens('ios');
CREATE OR REPLACE FUNCTION get_active_device_tokens(p_platform TEXT DEFAULT NULL)
RETURNS TABLE(token TEXT, platform TEXT) AS $$
BEGIN
  IF p_platform IS NOT NULL THEN
    RETURN QUERY SELECT dt.token, dt.platform 
    FROM device_tokens dt
    WHERE dt.platform = p_platform;
  ELSE
    RETURN QUERY SELECT dt.token, dt.platform 
    FROM device_tokens dt;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as sent
-- Usage: SELECT mark_notification_sent('post-uuid-here', 150, 2);
CREATE OR REPLACE FUNCTION mark_notification_sent(
  p_post_id UUID,
  p_success_count INTEGER DEFAULT 0,
  p_failure_count INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  INSERT INTO notification_history (post_id, success_count, failure_count)
  VALUES (p_post_id, p_success_count, p_failure_count)
  RETURNING id INTO v_record_id;
  
  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last_used timestamp on device token
CREATE OR REPLACE FUNCTION update_device_token_usage(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE device_tokens 
  SET last_used_at = NOW()
  WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EDGE FUNCTIONS SETUP (Supabase)
-- ============================================

-- These will be called by your iOS app
-- 1. POST /rest/v1/device_tokens (register token) - built-in
-- 2. POST /rest/v1/community_posts (create post) - built-in

-- Custom Edge Function for sending push notifications
-- Create this in Supabase Dashboard > Edge Functions
/*
CREATE FUNCTION send_push_notifications(post_id TEXT)
RETURNS JSON AS $$
DECLARE
  tokens TEXT[];
  result JSON;
BEGIN
  -- Get all iOS tokens
  SELECT array_agg(token) INTO tokens
  FROM device_tokens
  WHERE platform = 'ios';
  
  -- Call APNS (you'll need a server-side integration)
  -- This is a placeholder - actual implementation needs APNS HTTP/2 API
  
  result := json_build_object(
    'success', true,
    'token_count', array_length(tokens, 1),
    'tokens', tokens
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
