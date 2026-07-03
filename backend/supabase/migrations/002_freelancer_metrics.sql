-- Freelancer Metrics Tracking
-- Additional tables for tracking metrics not computable from existing data

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT, -- 'referral', 'upwork', 'linkedin', 'website', 'other'
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'past'
  first_project_date DATE,
  lifetime_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  hours_estimated NUMERIC,
  hours_actual NUMERIC,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'on_hold', 'cancelled'
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  hours_estimated NUMERIC,
  status TEXT DEFAULT 'sent', -- 'draft', 'sent', 'negotiating', 'won', 'lost'
  sent_date DATE,
  decision_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  sent_date DATE,
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE revenue_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL, -- 'project', 'retainer', 'product', 'other'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_user ON clients(user_id, status);
CREATE INDEX idx_projects_user ON projects(user_id, status);
CREATE INDEX idx_proposals_user ON proposals(user_id, status);
CREATE INDEX idx_invoices_user ON invoices(user_id, status);
CREATE INDEX idx_revenue_user_date ON revenue_log(user_id, date);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_own" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "projects_own" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "proposals_own" ON proposals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "invoices_own" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "revenue_own" ON revenue_log FOR ALL USING (auth.uid() = user_id);
