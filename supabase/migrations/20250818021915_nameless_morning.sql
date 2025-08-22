/*
  # Courier Service Database Schema

  1. New Tables
    - `couriers` - Courier profiles and information
    - `courier_service_areas` - Geographic service coverage areas
    - `courier_working_hours` - Working schedule definitions
    - `assignments` - Order assignments to couriers
    - `courier_locations` - Real-time location tracking
    - `assignment_history` - Assignment audit trail

  2. Enums
    - `courier_status` - Courier availability status
    - `vehicle_type` - Vehicle type enumeration
    - `assignment_status` - Assignment lifecycle status

  3. Indexes
    - Geographic indexes for location-based queries
    - Performance indexes for assignment queries
    - Composite indexes for filtering

  4. Constraints
    - Business rule validation
    - Data integrity constraints
    - Geographic coordinate validation

  5. Functions
    - Distance calculation function
    - Assignment validation triggers
*/

-- Create custom types
CREATE TYPE courier_status AS ENUM ('ACTIVE', 'INACTIVE', 'BUSY', 'OFFLINE', 'UNAVAILABLE');
CREATE TYPE vehicle_type AS ENUM ('BICYCLE', 'MOTORBIKE', 'CAR', 'WALKING');
CREATE TYPE assignment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED');

-- Enable PostGIS extension for geographic operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create couriers table
CREATE TABLE IF NOT EXISTS couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  phone varchar(20) NOT NULL UNIQUE,
  email varchar(255) NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL,
  vehicle_plate varchar(20),
  status courier_status NOT NULL DEFAULT 'INACTIVE',
  rating decimal(3,2) NOT NULL DEFAULT 5.00,
  completed_orders integer NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT couriers_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT couriers_completed_orders_check CHECK (completed_orders >= 0)
);

-- Create courier service areas table
CREATE TABLE IF NOT EXISTS courier_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  radius_km double precision NOT NULL,
  city varchar(100) NOT NULL,
  district varchar(100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT service_areas_lat_check CHECK (center_lat >= -90 AND center_lat <= 90),
  CONSTRAINT service_areas_lng_check CHECK (center_lng >= -180 AND center_lng <= 180),
  CONSTRAINT service_areas_radius_check CHECK (radius_km > 0 AND radius_km <= 100)
);

-- Create courier working hours table
CREATE TABLE IF NOT EXISTS courier_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT working_hours_day_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT working_hours_time_check CHECK (start_time < end_time),
  UNIQUE(courier_id, day_of_week)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  courier_id uuid NOT NULL REFERENCES couriers(id),
  status assignment_status NOT NULL DEFAULT 'PENDING',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  completed_at timestamptz,
  pickup_location jsonb NOT NULL,
  delivery_location jsonb NOT NULL,
  estimated_distance double precision NOT NULL,
  estimated_duration integer NOT NULL,
  actual_distance double precision,
  actual_duration integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT assignments_distance_check CHECK (estimated_distance >= 0),
  CONSTRAINT assignments_duration_check CHECK (estimated_duration >= 0),
  CONSTRAINT assignments_actual_distance_check CHECK (actual_distance IS NULL OR actual_distance >= 0),
  CONSTRAINT assignments_actual_duration_check CHECK (actual_duration IS NULL OR actual_duration >= 0)
);

-- Create courier locations table (for real-time tracking)
CREATE TABLE IF NOT EXISTS courier_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  accuracy double precision,
  speed double precision,
  heading double precision,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT locations_lat_check CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT locations_lng_check CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT locations_accuracy_check CHECK (accuracy IS NULL OR accuracy >= 0),
  CONSTRAINT locations_speed_check CHECK (speed IS NULL OR speed >= 0),
  CONSTRAINT locations_heading_check CHECK (heading IS NULL OR (heading >= 0 AND heading < 360))
);

-- Create assignment history table for audit trail
CREATE TABLE IF NOT EXISTS assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  previous_status assignment_status,
  new_status assignment_status NOT NULL,
  changed_by uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance

-- Courier indexes
CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status);
CREATE INDEX IF NOT EXISTS idx_couriers_is_online ON couriers(is_online);
CREATE INDEX IF NOT EXISTS idx_couriers_vehicle_type ON couriers(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_couriers_rating ON couriers(rating);
CREATE INDEX IF NOT EXISTS idx_couriers_last_seen ON couriers(last_seen_at);

-- Service area indexes
CREATE INDEX IF NOT EXISTS idx_service_areas_courier_id ON courier_service_areas(courier_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_is_active ON courier_service_areas(is_active);
CREATE INDEX IF NOT EXISTS idx_service_areas_city ON courier_service_areas(city);

-- Working hours indexes
CREATE INDEX IF NOT EXISTS idx_working_hours_courier_id ON courier_working_hours(courier_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON courier_working_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_working_hours_active ON courier_working_hours(is_active);

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_assignments_order_id ON assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_assignments_courier_id ON assignments(courier_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_at ON assignments(assigned_at);
CREATE INDEX IF NOT EXISTS idx_assignments_distance ON assignments(estimated_distance);

-- Location indexes (for geographic queries)
CREATE INDEX IF NOT EXISTS idx_courier_locations_courier_id ON courier_locations(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_locations_timestamp ON courier_locations(timestamp);

-- Geographic indexes using PostGIS
CREATE INDEX IF NOT EXISTS idx_service_areas_location ON courier_service_areas 
  USING GIST (ST_Point(center_lng, center_lat));

CREATE INDEX IF NOT EXISTS idx_courier_locations_point ON courier_locations 
  USING GIST (ST_Point(longitude, latitude));

-- Assignment history indexes
CREATE INDEX IF NOT EXISTS idx_assignment_history_assignment_id ON assignment_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_created_at ON assignment_history(created_at);

-- Create functions for business logic

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 double precision, 
  lng1 double precision, 
  lat2 double precision, 
  lng2 double precision
) RETURNS double precision AS $$
BEGIN
  RETURN ST_Distance(
    ST_Point(lng1, lat1)::geography,
    ST_Point(lng2, lat2)::geography
  ) / 1000.0; -- Convert meters to kilometers
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find available couriers within radius
CREATE OR REPLACE FUNCTION find_available_couriers(
  target_lat double precision,
  target_lng double precision,
  max_distance_km double precision DEFAULT 10.0
) RETURNS TABLE (
  courier_id uuid,
  distance_km double precision,
  current_lat double precision,
  current_lng double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    calculate_distance(cl.latitude, cl.longitude, target_lat, target_lng) as distance,
    cl.latitude,
    cl.longitude
  FROM couriers c
  JOIN courier_locations cl ON c.id = cl.courier_id
  WHERE c.status = 'ACTIVE'
    AND c.is_online = true
    AND cl.timestamp > now() - interval '5 minutes'
    AND calculate_distance(cl.latitude, cl.longitude, target_lat, target_lng) <= max_distance_km
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_couriers_updated_at
  BEFORE UPDATE ON couriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_areas_updated_at
  BEFORE UPDATE ON courier_service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_hours_updated_at
  BEFORE UPDATE ON courier_working_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger function for assignment history
CREATE OR REPLACE FUNCTION log_assignment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO assignment_history (assignment_id, previous_status, new_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status changed via API');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment status changes
CREATE TRIGGER log_assignment_status_changes
  AFTER UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION log_assignment_status_change();

-- Create view for courier availability
CREATE OR REPLACE VIEW courier_availability AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.vehicle_type,
  c.status,
  c.is_online,
  c.rating,
  c.completed_orders,
  cl.latitude as current_lat,
  cl.longitude as current_lng,
  cl.timestamp as location_updated_at,
  CASE 
    WHEN cl.timestamp > now() - interval '5 minutes' THEN true
    ELSE false
  END as location_fresh,
  CASE
    WHEN c.status = 'ACTIVE' AND c.is_online = true AND cl.timestamp > now() - interval '5 minutes' THEN true
    ELSE false
  END as is_available
FROM couriers c
LEFT JOIN LATERAL (
  SELECT latitude, longitude, timestamp
  FROM courier_locations
  WHERE courier_id = c.id
  ORDER BY timestamp DESC
  LIMIT 1
) cl ON true;