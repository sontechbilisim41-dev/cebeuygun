import { z } from 'zod';

// Search request schemas
export const SearchRequestSchema = z.object({
  q: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  delivery_time: z.number().min(0).optional(),
  express_only: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sort_by: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'rating', 'popularity']).default('relevance'),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(20),
  facets: z.boolean().default(true),
  highlight: z.boolean().default(true),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius_km: z.number().min(0).max(50).default(10),
  }).optional(),
});

export const SuggestionRequestSchema = z.object({
  q: z.string().min(1),
  size: z.number().min(1).max(20).default(10),
  types: z.array(z.enum(['product', 'category', 'brand'])).default(['product', 'category', 'brand']),
});

export const PopularProductsRequestSchema = z.object({
  category_id: z.string().uuid().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius_km: z.number().min(0).max(50).default(10),
  }).optional(),
  size: z.number().min(1).max(50).default(20),
});

// Response schemas
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  category_id: z.string().uuid(),
  category_name: z.string(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  base_price: z.number(),
  currency: z.string(),
  tax_rate: z.number(),
  base_stock: z.number(),
  tags: z.array(z.string()),
  attributes: z.record(z.any()),
  is_active: z.boolean(),
  is_express_delivery: z.boolean(),
  preparation_time: z.number(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().min(0).optional(),
  popularity_score: z.number().optional(),
  distance_km: z.number().optional(),
  seller_info: z.object({
    id: z.string().uuid(),
    name: z.string(),
    rating: z.number().min(0).max(5).optional(),
  }).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  score: z.number().optional(),
  highlight: z.record(z.array(z.string())).optional(),
});

export const FacetSchema = z.object({
  categories: z.array(z.object({
    key: z.string(),
    name: z.string(),
    doc_count: z.number(),
  })),
  brands: z.array(z.object({
    key: z.string(),
    doc_count: z.number(),
  })),
  price_ranges: z.array(z.object({
    key: z.string(),
    from: z.number().optional(),
    to: z.number().optional(),
    doc_count: z.number(),
  })),
  delivery_times: z.array(z.object({
    key: z.string(),
    from: z.number().optional(),
    to: z.number().optional(),
    doc_count: z.number(),
  })),
  tags: z.array(z.object({
    key: z.string(),
    doc_count: z.number(),
  })),
  ratings: z.array(z.object({
    key: z.string(),
    from: z.number().optional(),
    to: z.number().optional(),
    doc_count: z.number(),
  })),
});

export const SearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    products: z.array(ProductSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
    total_pages: z.number(),
    facets: FacetSchema.optional(),
    query_time_ms: z.number(),
    suggestions: z.array(z.string()).optional(),
    search_metadata: z.object({
      query_type: z.string(),
      filters_applied: z.array(z.string()),
      sort_applied: z.string(),
    }).optional(),
  }),
  message: z.string(),
});

export const SuggestionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    suggestions: z.array(z.object({
      text: z.string(),
      score: z.number(),
      type: z.enum(['product', 'category', 'brand']),
      category: z.string().optional(),
      product_count: z.number().optional(),
    })),
    query_time_ms: z.number(),
  }),
  message: z.string(),
});

// Kafka event schemas
export const ProductEventSchema = z.object({
  action: z.enum(['created', 'updated', 'deleted']),
  product_id: z.string().uuid(),
  product: ProductSchema.omit({ score: true, highlight: true }).optional(),
  timestamp: z.string(),
});

// Type exports
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>;
export type PopularProductsRequest = z.infer<typeof PopularProductsRequestSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Facet = z.infer<typeof FacetSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type SuggestionResponse = z.infer<typeof SuggestionResponseSchema>;
export type ProductEvent = z.infer<typeof ProductEventSchema>;