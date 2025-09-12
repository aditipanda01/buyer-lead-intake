const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./local.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS buyers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    city TEXT NOT NULL CHECK (city IN ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other')),
    property_type TEXT NOT NULL CHECK (property_type IN ('Apartment', 'Villa', 'Plot', 'Office', 'Retail')),
    bhk TEXT CHECK (bhk IN ('1', '2', '3', '4', 'Studio')),
    purpose TEXT NOT NULL CHECK (purpose IN ('Buy', 'Rent')),
    budget_min INTEGER,
    budget_max INTEGER,
    timeline TEXT NOT NULL CHECK (timeline IN ('0-3m', '3-6m', '>6m', 'Exploring')),
    source TEXT NOT NULL CHECK (source IN ('Website', 'Referral', 'Walk-in', 'Call', 'Other')),
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped')),
    notes TEXT,
    tags TEXT, -- JSON array
    owner_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS buyer_history (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    changed_at INTEGER NOT NULL,
    diff TEXT NOT NULL, -- JSON object
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_buyers_owner_id ON buyers(owner_id);
  CREATE INDEX IF NOT EXISTS idx_buyers_updated_at ON buyers(updated_at);
  CREATE INDEX IF NOT EXISTS idx_buyers_city ON buyers(city);
  CREATE INDEX IF NOT EXISTS idx_buyers_property_type ON buyers(property_type);
  CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);
  CREATE INDEX IF NOT EXISTS idx_buyer_history_buyer_id ON buyer_history(buyer_id);
`);

console.log('Database initialized successfully!');
db.close();
