-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'broker', 'applicant');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'applicant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID REFERENCES users(id),
    broker_id UUID REFERENCES users(id),
    manager_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    stage VARCHAR(100),
    loan_amount NUMERIC(15, 2),
    property_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id),
    uploader_id UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    document_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create extracted_data table
CREATE TABLE extracted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_value TEXT,
    confidence NUMERIC(5, 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, field_name)
);

-- Create clients table (for broker-client relationships)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(broker_id, client_user_id)
);

-- RLS Policies

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Policies for applications table
CREATE POLICY "Applicants can view their own applications" ON applications FOR SELECT USING (applicant_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Brokers can view applications of their clients" ON applications FOR SELECT USING (broker_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Managers can view all applications" ON applications FOR SELECT USING ((SELECT role FROM users WHERE auth_id = auth.uid()) = 'manager');
CREATE POLICY "Admins can view all applications" ON applications FOR SELECT USING ((SELECT role FROM users WHERE auth_id = auth.uid()) = 'admin');

-- Policies for documents table
CREATE POLICY "Users can view documents for their applications" ON documents FOR SELECT USING (application_id IN (SELECT id FROM applications));

-- Policies for clients table
CREATE POLICY "Brokers can manage their own client list" ON clients FOR ALL USING (broker_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Clients can view their broker relationship" ON clients FOR SELECT USING (client_user_id = (SELECT id FROM users WHERE auth_id = auth.uid())); 