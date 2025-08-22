-- Create product_media table
CREATE TABLE IF NOT EXISTS product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_variant_id ON product_media(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_media_type ON product_media(type);
CREATE INDEX IF NOT EXISTS idx_product_media_is_active ON product_media(is_active);
CREATE INDEX IF NOT EXISTS idx_product_media_sort_order ON product_media(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_product_media_updated_at 
    BEFORE UPDATE ON product_media 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();