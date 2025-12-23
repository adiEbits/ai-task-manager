-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI insights table (admin analytics)
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  conversation_type VARCHAR(50) NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update your admin user
UPDATE profiles SET role = 'admin' WHERE email = 'aditya@ealphabits.com';