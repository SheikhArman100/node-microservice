import { z } from 'zod';
import { UserRoles } from '../../constant';

const UpdateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    role: z.enum(UserRoles, { message: 'Invalid role' }).optional(),
    isVerified: z.boolean().optional(),
    address: z.string().min(10, 'Address must be at least 10 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    road: z.string().min(2, 'Road must be at least 2 characters').optional(),
  }).strict().optional(),
}).refine(
  (data) => {
    if (!data.body) {
      return false; // Body is undefined/null
    }
    return Object.keys(data.body).length > 0;
  },
);

export const UserValidation = {
  UpdateUserSchema,
};
