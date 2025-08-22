/*
  # Pricing & Commission Service Database Schema

  1. New Tables
    - `commission_rates` - Commission configuration by category, seller, and logistics provider
    - `pricing_rules` - Versioned pricing rules with effective date ranges
    - `feature_flags` - Feature flag management for gradual rollout
    - `pricing_quotes` - Quote history and caching
    - `commission_analytics` - Commission tracking and analytics

  2. Indexes
    - Composite indexes for fast commission rate lookups
    - Date range indexes for effective pricing rules
    - Geographic indexes for regional pricing

  3. Constraints
    - Ensure commission rates are positive
    - Validate effective date ranges
    - Enforce currency format
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Commission Rates Table
CREATE TABLE IF NOT EXISTS commission_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID,
    seller_id UUID,
    logistics_provider VARCHAR(100),
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('PERCENTAGE', 'FLAT', 'TIERED')),
    rate DECIMAL(10,4) NOT NULL CHECK (rate >= 0),
    min_amount DECIMAL(12,2) CHECK (min_amount >= 0),
    max_amount DECIMAL(12,2) CHECK (max_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'TRY',
    region VARCHAR(100),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 100 CHECK (priority >= 1 AND priority <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT commission_rates_amount_check CHECK (
        max_amount IS NULL OR min_amount IS NULL OR max_amount >= min_amount
    ),
    CONSTRAINT commission_rates_date_check CHECK (
        effective_to IS NULL OR effective_to > effective_from
    )
);

-- Pricing Rules Table (Versioned)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DELIVERY_FEE', 'SMALL_BASKET', 'COMMISSION', 'REGIONAL_FEE', 'EXPRESS_FEE')),
    configuration JSONB NOT NULL,
    region VARCHAR(100),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT pricing_rules_date_check CHECK (
        effective_to IS NULL OR effective_to > effective_from
    )
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BOOLEAN', 'STRING', 'NUMBER', 'PERCENTAGE')),
    value JSONB NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    rollout JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing Quotes Table (for caching and analytics)
CREATE TABLE IF NOT EXISTS pricing_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    quote_hash VARCHAR(64) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    delivery_fee DECIMAL(12,2) NOT NULL,
    small_basket_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'TRY',
    commission_breakdown JSONB NOT NULL,
    pricing_breakdown JSONB NOT NULL,
    applied_rules JSONB NOT NULL,
    feature_flags JSONB,
    region VARCHAR(100),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT pricing_quotes_amounts_positive CHECK (
        subtotal >= 0 AND tax_amount >= 0 AND delivery_fee >= 0 AND 
        small_basket_fee >= 0 AND total_amount >= 0
    )
);

-- Commission Analytics Table
CREATE TABLE IF NOT EXISTS commission_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    category_id UUID,
    seller_id UUID,
    region VARCHAR(100),
    total_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    average_rate DECIMAL(10,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_commission_rates_lookup ON commission_rates (
    category_id, seller_id, logistics_provider, region, effective_from, effective_to
) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_commission_rates_effective ON commission_rates (
    effective_from, effective_to
) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_commission_rates_priority ON commission_rates (
    priority DESC
) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pricing_rules_type_region ON pricing_rules (
    type, region, effective_from, effective_to
) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pricing_rules_version ON pricing_rules (
    name, version DESC
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags (key) WHERE is_enabled = true;

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_hash ON pricing_quotes (quote_hash, valid_until);

CREATE INDEX IF NOT EXISTS idx_pricing_quotes_customer ON pricing_quotes (customer_id, created_at);

CREATE INDEX IF NOT EXISTS idx_commission_analytics_period ON commission_analytics (
    period_start, period_end, category_id, seller_id, region
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commission_rates_updated_at 
    BEFORE UPDATE ON commission_rates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at 
    BEFORE UPDATE ON pricing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_analytics_updated_at 
    BEFORE UPDATE ON commission_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data for Testing
INSERT INTO feature_flags (key, name, description, type, value, is_enabled) VALUES
('dynamic_pricing', 'Dynamic Pricing', 'Enable dynamic pricing based on demand', 'BOOLEAN', 'true', true),
('regional_pricing', 'Regional Pricing', 'Enable region-based pricing variations', 'BOOLEAN', 'true', true),
('commission_tiers', 'Commission Tiers', 'Enable tiered commission rates', 'BOOLEAN', 'true', true),
('express_delivery_multiplier', 'Express Delivery Multiplier', 'Multiplier for express delivery fees', 'NUMBER', '2.0', true),
('small_basket_threshold', 'Small Basket Threshold', 'Minimum amount to avoid small basket fee', 'NUMBER', '50.00', true);

INSERT INTO pricing_rules (name, type, configuration, region, created_by) VALUES
('Standard Delivery Fee', 'DELIVERY_FEE', '{"base_fee": 10.00, "per_km": 1.50, "max_fee": 50.00}', NULL, uuid_generate_v4()),
('Istanbul Regional Fee', 'REGIONAL_FEE', '{"multiplier": 1.2, "base_adjustment": 2.00}', 'Istanbul', uuid_generate_v4()),
('Small Basket Fee', 'SMALL_BASKET', '{"threshold": 50.00, "fee": 5.00}', NULL, uuid_generate_v4()),
('Express Delivery Fee', 'EXPRESS_FEE', '{"multiplier": 2.0, "min_fee": 15.00}', NULL, uuid_generate_v4());

INSERT INTO commission_rates (commission_type, rate, currency, region, priority) VALUES
('PERCENTAGE', 15.00, 'TRY', NULL, 100),
('PERCENTAGE', 12.00, 'TRY', 'Istanbul', 200),
('PERCENTAGE', 18.00, 'TRY', 'Ankara', 200);