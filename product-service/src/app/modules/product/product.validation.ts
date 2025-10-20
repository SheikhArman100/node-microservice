import { z } from 'zod';

const createProductZodSchema = z.object({
    body: z.object({
        name: z.string({
            error: 'Name is required',
        }).min(1, 'Name cannot be empty'),
        imagelink: z.string({
            error: 'Image link is required',
        }).min(1, 'Image link cannot be empty'),
        stock: z.number({
            error: 'Stock is required',
        }).min(0, 'Stock cannot be negative'),
        category: z.string({
            error: 'Category is required',
        }).min(1, 'Category cannot be empty'),
    }),
});

const updateProductZodSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        // Example: email: z.string().email('Invalid email format').optional(),
        // Example: status: z.enum(['active', 'inactive']).optional(),
    }),
});

export const ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
};
