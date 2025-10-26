import { prisma } from '../../client';

/**
 * Generate a unique, user-friendly order number
 * Format: ORD-YYYY-XXX (e.g., ORD-2025-001)
 */
export const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();

  // Count orders created this year
  const orderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
  });

  // Generate sequential number (starting from 1)
  const sequenceNumber = (orderCount + 1).toString().padStart(3, '0');

  return `ORD-${year}-${sequenceNumber}`;
};
