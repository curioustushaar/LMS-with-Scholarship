-- Create settings tables for admin preferences

-- 1. Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  new_student_registration BOOLEAN DEFAULT TRUE,
  new_task_submission BOOLEAN DEFAULT TRUE,
  project_pending_approval BOOLEAN DEFAULT TRUE,
  new_support_ticket BOOLEAN DEFAULT TRUE,
  certificate_approval_request BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('platform_name', 'LMS Admin', 'Name of the learning management system'),
  ('support_email', 'support@lms.com', 'Support contact email'),
  ('default_course_duration', '12', 'Default course duration in weeks'),
  ('certificate_pass_percentage', '80', 'Minimum percentage required for certificate')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, body, description) VALUES
  ('welcome_email', 'Welcome to {{platform_name}}!', 
   'Hello {{student_name}},\n\nWelcome to {{platform_name}}! We are excited to have you join our learning community.\n\nYou can now access all courses and start your learning journey.\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when a new student registers'),
  ('password_reset', 'Password Reset Request',
   'Hello {{user_name}},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when password reset is requested'),
  ('certificate_issued', 'Congratulations! Your Certificate is Ready',
   'Hello {{student_name}},\n\nCongratulations! Your certificate for {{course_name}} has been approved and is now ready.\n\nYou can download it here: {{certificate_link}}\n\nWell done on completing the course!\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when certificate is approved')
ON CONFLICT (template_name) DO NOTHING;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
