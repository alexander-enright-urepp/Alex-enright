-- ============================================
-- CONTACT FORM TABLE
-- ============================================

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
CREATE POLICY "Public can insert contact_submissions"
ON contact_submissions FOR INSERT WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Only admins can view contact_submissions"
ON contact_submissions FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);
