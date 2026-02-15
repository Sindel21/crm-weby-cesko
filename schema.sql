-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'sales')) DEFAULT 'sales',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    city TEXT,
    address TEXT,
    website TEXT,
    rating FLOAT,
    reviews INTEGER,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, address)
);

-- Websites Table (Analysis)
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    pagespeed_mobile INTEGER,
    pagespeed_desktop INTEGER,
    has_ssl BOOLEAN,
    is_mobile_friendly BOOLEAN,
    load_time FLOAT,
    uses_ads BOOLEAN,
    analysis_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Owners Table
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    owner_name TEXT,
    confidence FLOAT,
    source TEXT
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone TEXT,
    email TEXT,
    validated BOOLEAN DEFAULT FALSE
);

-- Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    score INTEGER,
    status TEXT CHECK (status IN ('new', 'called', 'interested', 'not_interested', 'closed')) DEFAULT 'new',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial keys
INSERT INTO settings (key, value) VALUES 
('apify_token', ''),
('gemini_api_key', ''),
('pagespeed_api_key', ''),
('upstash_redis_url', ''),
('upstash_redis_token', '')
ON CONFLICT (key) DO NOTHING;
