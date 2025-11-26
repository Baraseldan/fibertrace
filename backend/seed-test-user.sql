-- FiberTrace Test User Seed Script
-- Run this after creating the database schema

-- Insert test admin user
INSERT INTO users (id, full_name, email, password_hash, role, email_verified, created_at, last_login)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@fibertrace.app',
  'admin123456',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT(email) DO NOTHING;

-- Insert test technician user
INSERT INTO users (id, full_name, email, password_hash, role, email_verified, created_at, last_login)
VALUES (
  gen_random_uuid(),
  'John Technician',
  'john@fibertrace.app',
  'tech123456',
  'technician',
  true,
  NOW(),
  NOW()
) ON CONFLICT(email) DO NOTHING;

-- Insert test field user
INSERT INTO users (id, full_name, email, password_hash, role, email_verified, created_at, last_login)
VALUES (
  gen_random_uuid(),
  'Jane Field Tech',
  'jane@fibertrace.app',
  'field123456',
  'field_technician',
  true,
  NOW(),
  NOW()
) ON CONFLICT(email) DO NOTHING;

-- Insert test nodes for map
INSERT INTO nodes (node_name, node_type, latitude, longitude, power_status, power_rating, description, created_at)
VALUES 
  ('OLT-001', 'OLT', 37.78825, -122.4324, 'active', -5.0, 'Main Optical Line Terminal', NOW()),
  ('Splitter-01', 'Splitter', 37.78900, -122.4300, 'active', -10.0, '1:8 Splitter', NOW()),
  ('FAT-001', 'FAT', 37.78950, -122.4280, 'active', -15.0, 'Fiber Access Terminal', NOW()),
  ('ATB-001', 'ATB', 37.79000, -122.4260, 'active', -20.0, 'Aerial Terminal Box', NOW())
ON CONFLICT DO NOTHING;

-- Insert test fiber lines
INSERT INTO fiber_lines (start_node_id, end_node_id, distance_km, cable_length_km, fiber_type, status, created_at)
SELECT 
  (SELECT id FROM nodes WHERE node_name = 'OLT-001' LIMIT 1),
  (SELECT id FROM nodes WHERE node_name = 'Splitter-01' LIMIT 1),
  2.5,
  2.75,
  'G.652D',
  'active',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM fiber_lines 
  WHERE start_node_id = (SELECT id FROM nodes WHERE node_name = 'OLT-001' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insert sample power readings
INSERT INTO power_readings (node_id, power_in, power_out, loss_db, created_at)
SELECT 
  id,
  -5.0,
  -10.0,
  5.0,
  NOW()
FROM nodes WHERE node_type = 'OLT'
ON CONFLICT DO NOTHING;

SELECT '✅ Test data seeded successfully!' as status;
