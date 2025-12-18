-- Create menu_items table for chef menu management
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id VARCHAR NOT NULL REFERENCES chef_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(100),
  dietary_info TEXT[],
  image_url VARCHAR,
  is_available BOOLEAN DEFAULT true,
  prep_time INTEGER,
  serving_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on chef_id for faster lookups
CREATE INDEX IF NOT EXISTS menu_items_chef_id_idx ON menu_items(chef_id);

