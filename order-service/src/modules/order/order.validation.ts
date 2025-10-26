import { z } from 'zod';

const createOrderItemZodSchema = z.object({
  productId: z.string({
    required_error: 'Product ID is required',
  }).min(1, 'Product ID cannot be empty'),
  quantity: z.number({
    required_error: 'Quantity is required',
  }).min(1, 'Quantity must be at least 1'),
  price: z.number({
    required_error: 'Price is required',
  }).min(0, 'Price cannot be negative'),
});

const createOrderZodSchema = z.object({
  body: z.object({
    orderItems: z.array(createOrderItemZodSchema, {
      required_error: 'Order items are required',
    }).min(1, 'At least one order item is required'),
  }),
});

const updateOrderStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid status value',
    }),
  }),
});

const orderFilterZodSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    searchTerm: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderStatusZodSchema,
  orderFilterZodSchema,
};
