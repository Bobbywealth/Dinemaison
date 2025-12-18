-- Add Chef Ameer Natson to the database
-- Run this script directly in your database

-- First, create the user account
-- Note: Replace the password hash below or update after creation
INSERT INTO users (email, password, "firstName", "lastName")
VALUES (
  'ameer.natson@dinemaison.com',
  -- This is the bcrypt hash for 'chef123' (10 rounds)
  '$2a$10$YourHashHere', -- You'll need to generate this or update it after
  'Ameer',
  'Natson'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Get the user ID (you'll need to look this up if the above conflicts)
-- Replace 'USER_ID_HERE' with the actual user ID in the statements below

-- Create user role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'chef')
ON CONFLICT DO NOTHING;

-- Create chef profile
INSERT INTO chef_profiles (
  user_id,
  display_name,
  bio,
  profile_image_url,
  years_experience,
  cuisines,
  dietary_specialties,
  services_offered,
  minimum_spend,
  minimum_guests,
  maximum_guests,
  hourly_rate,
  verification_level,
  is_certified,
  is_active,
  commission_rate,
  average_rating,
  total_reviews,
  completed_bookings
)
VALUES (
  'USER_ID_HERE',
  'Ameer Natson',
  'Visionary culinary artist blending bold international flavors with refined technique. With a passion for innovation and a deep respect for tradition, Chef Ameer crafts unforgettable dining experiences that celebrate the art of food. From contemporary fusion to classic comfort with a twist, his dynamic approach transforms every meal into a memorable journey. Known for his creative plating, locally-sourced ingredients, and warm hospitality, Chef Ameer brings both expertise and soul to your table.',
  'https://freeimage.host/i/fl0CC0b',
  12,
  ARRAY['Contemporary American', 'Fusion', 'Mediterranean', 'Caribbean'],
  ARRAY['Vegan', 'Vegetarian', 'Gluten-Free', 'Paleo'],
  ARRAY['Private Dinner', 'Event Catering', 'Meal Prep', 'Cooking Class'],
  300.00,
  2,
  16,
  175.00,
  'certified',
  true,
  true,
  15.00,
  4.90,
  18,
  32
)
ON CONFLICT DO NOTHING;
