-- Create seller_products table for seller-specific overrides
CREATE TABLE IF NOT EXISTS seller_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    seller_sku VARCHAR(100),
    price DECIMAL(12,2) CHECK (price IS NULL OR price >= 0),
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    min_stock INTEGER CHECK (min_stock IS NULL OR min_stock >= 0),
    max_stock INTEGER CHECK (max_stock IS NULL OR max_stock >= COALESCE(min_stock, 0)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    preparation_time INTEGER CHECK (preparation_time IS NULL OR preparation_time >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_product_id ON seller_products(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_variant_id ON seller_products(variant_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_is_active ON seller_products(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_products_is_visible ON seller_products(is_visible);
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_sku ON seller_products(seller_sku);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_products_unique 
    ON seller_products(seller_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID));

CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_products_seller_sku_unique 
    ON seller_products(seller_id, seller_sku) WHERE seller_sku IS NOT NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_seller_products_updated_at 
    BEFORE UPDATE ON seller_products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();