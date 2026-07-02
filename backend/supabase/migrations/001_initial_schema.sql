CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  monthly_revenue NUMERIC DEFAULT 0,
  weekly_revenue NUMERIC DEFAULT 0,
  daily_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  category TEXT NOT NULL,
  hours_spent NUMERIC NOT NULL,
  result TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  content JSONB NOT NULL,
  period_start DATE,
  period_end DATE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user_date ON daily_activities(user_id, date);
CREATE INDEX idx_activities_user_category ON daily_activities(user_id, category);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_reports_user_type ON ai_reports(user_id, report_type, generated_at);
CREATE INDEX idx_users_onboarding ON users(onboarding_completed);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "business_own" ON business_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "activities_own" ON daily_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tasks_own" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reports_own" ON ai_reports FOR ALL USING (auth.uid() = user_id);
