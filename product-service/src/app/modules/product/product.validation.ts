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
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      imagelink: z.string().min(1, 'Image link cannot be empty').optional(),
      stock: z
        .number({
          error: 'Stock must be a number',
        })
        .min(0, 'Stock cannot be negative')
        .optional(),
      category: z.string().min(1, 'Category cannot be empty').optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: 'At least one field must be provided for update',
        path: [],
      }
    ),
});

export const ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
};
