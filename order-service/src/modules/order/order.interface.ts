import { OrderStatus } from '@prisma/client';

export type IOrder = {
  orderNumber?: string; // Optional in input, will be generated
  userId: string;
  totalAmount: number;
  status?: OrderStatus;
  orderItems: IOrderItem[];
};

export type IOrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type IOrderFilters = {
  searchTerm?: string;
  status?: OrderStatus;
  userId?: string;
};

export type IOrderItemWithProduct = IOrderItem & {
  product?: {
    id: string;
    name: string;
    imagelink?: string;
    category: string;
  };
};

export type IOrderWithDetails = {
  id: number;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: IOrderItemWithProduct[];
};
