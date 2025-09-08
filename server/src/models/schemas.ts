import { z } from 'zod';

/**
 * Zod validation schemas for API requests and data validation
 */

// Common schemas
const DateSchema = z.union([z.date(), z.string().datetime()]);
const PositiveIntSchema = z.number().int().positive();
const NonNegativeIntSchema = z.number().int().min(0);

// Product schemas
const ProductChoiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: NonNegativeIntSchema
});

const ProductOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  required: z.boolean().optional(),
  maxSelections: PositiveIntSchema.optional(),
  choices: z.array(ProductChoiceSchema).min(1)
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1).max(100),
  price: NonNegativeIntSchema,
  options: z.array(ProductOptionSchema).optional(),
  available: z.boolean().default(true),
  position: NonNegativeIntSchema.default(0),
  isHighlighted: z.boolean().optional(),
  isDaySpecial: z.boolean().optional()
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductParamsSchema = z.object({
  restaurantId: z.string().min(1),
  productId: z.string().min(1)
});

// Order schemas
const SelectedOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  choice: z.string().min(1),
  price: NonNegativeIntSchema
});

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  qty: PositiveIntSchema,
  unitPrice: NonNegativeIntSchema,
  options: z.array(SelectedOptionSchema).default([]),
  notes: z.string().max(500).optional()
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  channel: z.enum(['dine_in', 'takeaway', 'delivery']),
  tableId: z.string().optional(),
  customer: z.object({
    name: z.string().max(100).optional(),
    phone: z.string().max(20).optional()
  }).optional()
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'draft', 
    'placed', 
    'confirmed', 
    'in_preparation', 
    'ready', 
    'served', 
    'closed', 
    'canceled'
  ])
});

export const OrderParamsSchema = z.object({
  restaurantId: z.string().min(1),
  orderId: z.string().min(1)
});

// Table schemas
export const CreateTableSchema = z.object({
  number: z.string().min(1).max(20),
  qrcodeUrl: z.string().url().optional(),
  active: z.boolean().default(true)
});

export const UpdateTableSchema = CreateTableSchema.partial();

export const TableParamsSchema = z.object({
  restaurantId: z.string().min(1),
  tableId: z.string().min(1)
});

// Coupon schemas
export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['percent', 'fixed']),
  value: PositiveIntSchema,
  validFrom: DateSchema,
  validTo: DateSchema,
  minSubtotal: NonNegativeIntSchema.optional(),
  active: z.boolean().default(true)
}).refine(data => new Date(data.validTo) > new Date(data.validFrom), {
  message: "Valid to date must be after valid from date",
  path: ["validTo"]
});

export const UpdateCouponSchema = CreateCouponSchema.partial();

export const CouponParamsSchema = z.object({
  restaurantId: z.string().min(1),
  couponId: z.string().min(1)
});

export const ValidateCouponSchema = z.object({
  code: z.string().min(3).max(20)
});

// Restaurant schemas
export const CreateRestaurantSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  address: z.string().min(10).max(500),
  phone: z.string().min(10).max(20),
  logoUrl: z.string().url().optional(),
  active: z.boolean().default(true)
});

export const UpdateRestaurantSchema = CreateRestaurantSchema.partial();

export const RestaurantParamsSchema = z.object({
  restaurantId: z.string().min(1)
});

// Settings schemas
export const UpdateSettingsSchema = z.object({
  delivery: z.object({
    enabled: z.boolean(),
    zones: z.array(z.string()).optional(),
    feeType: z.enum(['fixed', 'by_distance']),
    feeValue: NonNegativeIntSchema
  }).optional(),
  dineIn: z.object({
    serviceFeePercent: z.number().min(0).max(100).optional()
  }).optional(),
  pickup: z.object({
    enabled: z.boolean()
  }).optional(),
  whatsapp: z.object({
    enabled: z.boolean(),
    phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
    messageTemplate: z.string().max(1000).optional()
  }).optional()
});

// Query schemas
export const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(PositiveIntSchema).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const ProductQuerySchema = PaginationSchema.extend({
  category: z.string().optional(),
  available: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional()
});

export const OrderQuerySchema = PaginationSchema.extend({
  status: z.string().optional(),
  channel: z.enum(['dine_in', 'takeaway', 'delivery']).optional(),
  tableId: z.string().optional(),
  dateFrom: DateSchema.optional(),
  dateTo: DateSchema.optional()
});

// File upload schemas
export const FileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(type => 
    ['image/jpeg', 'image/png', 'image/webp'].includes(type), 
    'Only JPEG, PNG and WebP images are allowed'
  ),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  buffer: z.instanceof(Buffer)
});

// Common parameter schemas
export const RestaurantSlugSchema = z.object({
  slug: z.string().min(3).max(50)
});

export const IdParamSchema = z.object({
  id: z.string().min(1)
});

// Health check schema
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  services: z.object({
    firebase: z.object({
      status: z.enum(['connected', 'error']),
      message: z.string()
    }),
    database: z.object({
      status: z.enum(['connected', 'error']),
      message: z.string()
    })
  }),
  uptime: z.number(),
  memory: z.object({
    used: z.number(),
    total: z.number()
  })
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;
export type UpdateCouponInput = z.infer<typeof UpdateCouponSchema>;
export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof UpdateRestaurantSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
