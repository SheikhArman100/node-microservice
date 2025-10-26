import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';


import { IOrder } from './order.interface';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { OrderService } from './order.service';
import pick from '../../helpers/pick';
import { orderFilterableFields } from './order.constant';
import { paginationFields } from '../../constant';
import httpStatus from 'http-status';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const orderData = req.body as IOrder;
  const userId = req.user?.id;
  const result = await OrderService.createOrder(orderData, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, orderFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  // For regular users, only show their own orders
  // Admin users can see all orders (handled in service)
  const userId = req.user?.id;

  const result = await OrderService.getAllOrders(filters, paginationOptions, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getOrderByID = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await OrderService.getOrderByID(parseInt(id), userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };
  const userId = req.user?.id;

  const result = await OrderService.updateOrderStatus(parseInt(id), status, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await OrderService.deleteOrder(parseInt(id), userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderByID,
  updateOrderStatus,
  deleteOrder,
};
