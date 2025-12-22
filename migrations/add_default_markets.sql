-- Migration: Add default markets for major US cities
-- This ensures chefs can be assigned to geographic markets
-- Run this after initial database setup

-- Insert default markets (major US cities)
INSERT INTO markets (id, name, slug, description, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'New York City', 'new-york-city', 'Manhattan, Brooklyn, Queens, Bronx, and Staten Island', true, NOW()),
  (gen_random_uuid(), 'Los Angeles', 'los-angeles', 'Los Angeles County and surrounding areas', true, NOW()),
  (gen_random_uuid(), 'Chicago', 'chicago', 'Chicago and surrounding suburbs', true, NOW()),
  (gen_random_uuid(), 'San Francisco Bay Area', 'san-francisco', 'San Francisco, Oakland, San Jose, and Bay Area', true, NOW()),
  (gen_random_uuid(), 'Miami', 'miami', 'Miami-Dade, Broward, and Palm Beach counties', true, NOW()),
  (gen_random_uuid(), 'Boston', 'boston', 'Greater Boston area', true, NOW()),
  (gen_random_uuid(), 'Washington DC', 'washington-dc', 'DC, Northern Virginia, and Maryland suburbs', true, NOW()),
  (gen_random_uuid(), 'Seattle', 'seattle', 'Seattle and Puget Sound region', true, NOW()),
  (gen_random_uuid(), 'Austin', 'austin', 'Austin and Central Texas', true, NOW()),
  (gen_random_uuid(), 'Denver', 'denver', 'Denver metro area and Front Range', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Optional: Assign existing chefs to default market (New York City)
-- This ensures existing chefs appear in search results
-- Adjust the WHERE clause based on your needs

DO $$
DECLARE
  nyc_market_id VARCHAR;
  chef_record RECORD;
BEGIN
  -- Get New York City market ID
  SELECT id INTO nyc_market_id FROM markets WHERE slug = 'new-york-city' LIMIT 1;
  
  -- If NYC market exists, assign all existing chefs to it (as a default)
  IF nyc_market_id IS NOT NULL THEN
    FOR chef_record IN SELECT id FROM chef_profiles WHERE is_active = true
    LOOP
      INSERT INTO chef_markets (id, chef_id, market_id, created_at)
      VALUES (gen_random_uuid(), chef_record.id, nyc_market_id, NOW())
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Verify migration
SELECT 'Markets created:' as message, COUNT(*) as count FROM markets;
SELECT 'Chef-market assignments:' as message, COUNT(*) as count FROM chef_markets;



