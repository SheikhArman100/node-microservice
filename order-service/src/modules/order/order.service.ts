import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../client';
import { IOrder, IOrderFilters, IOrderWithDetails } from './order.interface';
import { calculatePagination } from '../../helpers/paginationHelper';
import { IGenericResponse, IPaginationOptions } from '../../interfaces/common';
import { publishOrderEvent } from '../../shared/rabbitmq/eventPublisher';
import { generateOrderNumber } from './order.utils';
import ApiError from '../../errors/ApiError';
import status from 'http-status';

const createOrder = async (
  orderData: IOrder,
  userId: string
): Promise<IOrderWithDetails> => {
  // Validate products exist and are in stock
  for (const item of orderData.orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new ApiError(status.NOT_FOUND, `Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        status.BAD_REQUEST,
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  // Calculate total amount
  const totalAmount = orderData.orderItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order with transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
        orderItems: {
          create: orderData.orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Update product stock
    for (const item of orderData.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  });

  // Fetch the complete order with includes
  const completeOrder = await prisma.order.findUnique({
    where: { id: result.id },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              imagelink: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Publish order created event
  try {
    await publishOrderEvent('order.created', {
      id: completeOrder!.id.toString(),
      orderNumber: completeOrder!.orderNumber,
      userId: completeOrder!.userId,
      totalAmount: completeOrder!.totalAmount,
      status: completeOrder!.status,
      orderItems: completeOrder!.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error('Failed to publish order created event:', error);

  }

  return completeOrder as IOrderWithDetails;
};

const getAllOrders = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
  userId?: string
): Promise<IGenericResponse<IOrderWithDetails[]>> => {
  const { searchTerm, status: orderStatus } = filters;
  const { page, limit, skip, orderBy } = calculatePagination(paginationOptions);

  const whereConditions: Prisma.OrderWhereInput = {};

  // Users can only see their own orders unless they're admin
  if (userId) {
    whereConditions.userId = userId;
  }

  if (orderStatus) {
    whereConditions.status = orderStatus;
  }

  if (searchTerm) {
    whereConditions.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
    ];
  }

  const count = await prisma.order.count({ where: whereConditions });

  const result = await prisma.order.findMany({
    where: whereConditions,
    orderBy,
    skip,
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              imagelink: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    meta: {
      page,
      limit: limit === 0 ? count : limit,
      count,
    },
    data: result as IOrderWithDetails[],
  };
};

const getOrderByID = async (
  id: number,
  userId?: string
): Promise<IOrderWithDetails | null> => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              imagelink: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(status.NOT_FOUND, 'Order not found');
  }

  // Users can only see their own orders
  if (userId && order.userId !== userId) {
    throw new ApiError(status.FORBIDDEN, 'You can only view your own orders');
  }

  return order as IOrderWithDetails;
};

const updateOrderStatus = async (
  id: number,
  newStatus: OrderStatus,
  userId?: string
): Promise<IOrderWithDetails> => {
  // Get current order with order items
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!currentOrder) {
    throw new ApiError(status.NOT_FOUND, 'Order not found');
  }

  // Users can only update their own orders
  if (userId && currentOrder.userId !== userId) {
    throw new ApiError(status.FORBIDDEN, 'You can only update your own orders');
  }

  // Validate status transitions
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.DELIVERED],
    DELIVERED: [], // Final state
    CANCELLED: [], // Final state
  };

  if (!validTransitions[currentOrder.status].includes(newStatus)) {
    throw new ApiError(
      status.BAD_REQUEST,
      `Cannot change order status from ${currentOrder.status} to ${newStatus}`
    );
  }

  // If cancelling, restore product stock
  if (newStatus === OrderStatus.CANCELLED && currentOrder.status !== OrderStatus.CANCELLED) {
    await prisma.$transaction(async (tx) => {
      for (const item of currentOrder.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imagelink: true,
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Publish order updated event
  try {
    await publishOrderEvent('order.updated', {
      id: updatedOrder.id.toString(),
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      totalAmount: updatedOrder.totalAmount,
      status: updatedOrder.status,
      orderItems: updatedOrder.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error('Failed to publish order updated event:', error);
  }

  return updatedOrder as IOrderWithDetails;
};

const deleteOrder = async (
  id: number,
  userId?: string
): Promise<{ id: number }> => {
  // Get current order
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!currentOrder) {
    throw new ApiError(status.NOT_FOUND, 'Order not found');
  }

  // Users can only delete their own orders
  if (userId && currentOrder.userId !== userId) {
    throw new ApiError(status.FORBIDDEN, 'You can only delete your own orders');
  }

  // Only allow deletion of pending orders
  if (currentOrder.status !== OrderStatus.PENDING) {
    throw new ApiError(
      status.BAD_REQUEST,
      'Can only delete orders with PENDING status'
    );
  }

  // Delete order and restore stock
  await prisma.$transaction(async (tx) => {
    // Restore product stock
    for (const item of currentOrder.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Delete order (cascade will delete order items)
    await tx.order.delete({
      where: { id },
    });
  });

  // Publish order cancelled event
  try {
    await publishOrderEvent('order.cancelled', {
      id: currentOrder.id.toString(),
      orderNumber: currentOrder.orderNumber,
      userId: currentOrder.userId,
      totalAmount: currentOrder.totalAmount,
      status: OrderStatus.CANCELLED,
      orderItems: currentOrder.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error('Failed to publish order cancelled event:', error);
  }

  return { id };
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderByID,
  updateOrderStatus,
  deleteOrder,
};
