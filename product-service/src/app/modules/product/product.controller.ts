import { Request, Response } from 'express';

import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';
import { productFilterableFields } from './product.constant';
import httpStatus from 'http-status';
import pick from '../../../helpers/pick';
import { paginationFields } from '../../../constant';
import { IProduct } from './product.interface';
import { UserInfoFromToken } from '../../../interfaces/common';

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.createProduct(req.body as Partial<IProduct>,req.user as UserInfoFromToken);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    
    const result = await ProductService.getAllProducts(filters, paginationOptions);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Products retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getProductByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.getProductByID(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Product retrieved successfully',
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user?.id };
    const result = await ProductService.updateProduct(id, updateData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
});

const deleteProductByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.deleteProductByID(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

export const ProductController = {
    createProduct,
    getAllProducts,
    getProductByID,
    updateProduct,
    deleteProductByID,
};
