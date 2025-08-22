/*
  # Promotion Service Database Schema

  1. New Tables
    - `campaigns` - Campaign definitions with rules and metadata
    - `coupons` - Individual coupon codes with usage tracking
    - `campaign_usage` - Usage tracking for campaigns
    - `campaign_audit` - Audit trail for all promotional activities
    - `coupon_pools` - Managed coupon pools for campaigns

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Audit trail for all promotional activities

  3. Performance
    - Indexes for fast campaign lookup
    - Partial indexes for active campaigns
    - JSONB indexes for rule conditions
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Campaign status enum
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'expired', 'completed');

-- Campaign type enum
CREATE TYPE campaign_type AS ENUM ('percentage_discount', 'flat_discount', 'free_delivery', 'loyalty_reward', 'flash_sale', 'first_order');

-- Discount type enum
CREATE TYPE discount_type AS ENUM ('percentage', 'flat_amount', 'free_delivery');

-- Audit action enum
CREATE TYPE audit_action AS ENUM ('applied', 'excluded', 'conflict_resolved', 'budget_exceeded', 'usage_limit_reached');

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(200) NOT NULL,
  description text,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  rules jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT false,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  budget jsonb, -- {amount: number, currency: string}
  spent_budget jsonb NOT NULL DEFAULT '{"amount": 0, "currency": "TRY"}',
  max_usage integer,
  current_usage integer NOT NULL DEFAULT 0,
  max_usage_per_user integer,
  priority integer NOT NULL DEFAULT 100,
  is_exclusive boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT campaigns_valid_dates CHECK (valid_from < valid_until),
  CONSTRAINT campaigns_priority_range CHECK (priority >= 1 AND priority <= 1000),
  CONSTRAINT campaigns_usage_positive CHECK (current_usage >= 0),
  CONSTRAINT campaigns_max_usage_positive CHECK (max_usage IS NULL OR max_usage > 0),
  CONSTRAINT campaigns_max_usage_per_user_positive CHECK (max_usage_per_user IS NULL OR max_usage_per_user > 0)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code varchar(50) NOT NULL UNIQUE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  discount_type discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  min_order_amount jsonb, -- {amount: number, currency: string}
  max_discount_amount jsonb, -- {amount: number, currency: string}
  usage_limit integer NOT NULL DEFAULT 1,
  usage_count integer NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  applicable_products uuid[],
  applicable_categories uuid[],
  excluded_products uuid[],
  user_restrictions jsonb, -- {roles: [], segments: [], cities: [], maxUsagePerUser: number}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT coupons_valid_dates CHECK (valid_from < valid_until),
  CONSTRAINT coupons_discount_value_positive CHECK (discount_value >= 0),
  CONSTRAINT coupons_usage_positive CHECK (usage_count >= 0),
  CONSTRAINT coupons_usage_limit_positive CHECK (usage_limit > 0),
  CONSTRAINT coupons_usage_within_limit CHECK (usage_count <= usage_limit)
);

-- Campaign usage tracking
CREATE TABLE IF NOT EXISTS campaign_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  order_id uuid,
  discount_amount jsonb NOT NULL, -- {amount: number, currency: string}
  applied_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  
  CONSTRAINT campaign_usage_unique_order UNIQUE (campaign_id, order_id) DEFERRABLE INITIALLY DEFERRED
);

-- Campaign audit trail
CREATE TABLE IF NOT EXISTS campaign_audit (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  customer_id uuid,
  action audit_action NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  session_id uuid,
  ip_address inet,
  user_agent text
);

-- Coupon pools for managed generation
CREATE TABLE IF NOT EXISTS coupon_pools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  pool_name varchar(100) NOT NULL,
  total_coupons integer NOT NULL,
  used_coupons integer NOT NULL DEFAULT 0,
  template jsonb NOT NULL, -- Coupon generation template
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT coupon_pools_positive_counts CHECK (total_coupons > 0 AND used_coupons >= 0),
  CONSTRAINT coupon_pools_usage_within_total CHECK (used_coupons <= total_coupons)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns (is_active, status, valid_from, valid_until) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_priority ON campaigns (priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns (type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns (valid_from, valid_until);

-- JSONB indexes for rule evaluation
CREATE INDEX IF NOT EXISTS idx_campaigns_rules_gin ON campaigns USING gin (rules);

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_campaign ON coupons (campaign_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (is_active, valid_from, valid_until) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_usage ON coupons (usage_count, usage_limit);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_campaign_usage_campaign ON campaign_usage (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_usage_customer ON campaign_usage (customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_usage_applied_at ON campaign_usage (applied_at);
CREATE INDEX IF NOT EXISTS idx_campaign_usage_order ON campaign_usage (order_id);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_campaign_audit_campaign ON campaign_audit (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_customer ON campaign_audit (customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_timestamp ON campaign_audit (timestamp);
CREATE INDEX IF NOT EXISTS idx_campaign_audit_action ON campaign_audit (action);

-- Pool management indexes
CREATE INDEX IF NOT EXISTS idx_coupon_pools_campaign ON coupon_pools (campaign_id);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_pools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Campaigns are viewable by everyone"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Campaigns can be managed by admins"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for coupons
CREATE POLICY "Coupons are viewable by everyone"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coupons can be managed by admins"
  ON coupons
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for usage tracking
CREATE POLICY "Users can view their own usage"
  ON campaign_usage
  FOR SELECT
  TO authenticated
  USING (customer_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Usage can be inserted by system"
  ON campaign_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for audit
CREATE POLICY "Audit logs viewable by admins"
  ON campaign_audit
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Audit logs can be inserted by system"
  ON campaign_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_pools_updated_at
  BEFORE UPDATE ON coupon_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate campaign rules JSON structure
CREATE OR REPLACE FUNCTION validate_campaign_rules(rules jsonb)
RETURNS boolean AS $$
BEGIN
  -- Basic validation that rules is an array
  IF jsonb_typeof(rules) != 'array' THEN
    RETURN false;
  END IF;
  
  -- Additional validation can be added here
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Add constraint for rule validation
ALTER TABLE campaigns ADD CONSTRAINT campaigns_valid_rules CHECK (validate_campaign_rules(rules));

-- Sample data for testing
INSERT INTO campaigns (id, name, description, type, status, rules, is_active, valid_from, valid_until, priority) VALUES
(
  uuid_generate_v4(),
  'First Order Discount',
  '20% discount for first-time customers',
  'first_order',
  'active',
  '[{
    "id": "rule1",
    "name": "First Order Rule",
    "description": "20% off for new customers",
    "conditions": [
      {"type": "order_count", "operator": "equals", "value": 0}
    ],
    "effects": [
      {"type": "percentage_discount", "value": 20, "target": "cart_total"}
    ],
    "priority": 200,
    "isExclusive": false,
    "validFrom": "2025-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }]',
  true,
  '2025-01-01 00:00:00+00',
  '2025-12-31 23:59:59+00',
  200
),
(
  uuid_generate_v4(),
  'Free Delivery Istanbul',
  'Free delivery for orders in Istanbul above 100 TRY',
  'free_delivery',
  'active',
  '[{
    "id": "rule2",
    "name": "Istanbul Free Delivery",
    "description": "Free delivery in Istanbul",
    "conditions": [
      {"type": "location", "operator": "equals", "value": "Istanbul", "field": "city"},
      {"type": "cart_total", "operator": "greater_equal", "value": 10000}
    ],
    "effects": [
      {"type": "free_delivery", "value": 0, "target": "delivery_fee"}
    ],
    "priority": 150,
    "isExclusive": false,
    "validFrom": "2025-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }]',
  true,
  '2025-01-01 00:00:00+00',
  '2025-12-31 23:59:59+00',
  150
);

-- Sample coupons
INSERT INTO coupons (id, code, discount_type, discount_value, usage_limit, valid_from, valid_until) VALUES
(uuid_generate_v4(), 'WELCOME20', 'percentage', 20, 1000, now(), now() + interval '30 days'),
(uuid_generate_v4(), 'SAVE50', 'flat_amount', 50, 500, now(), now() + interval '7 days'),
(uuid_generate_v4(), 'FREEDEL', 'free_delivery', 0, 100, now(), now() + interval '14 days');