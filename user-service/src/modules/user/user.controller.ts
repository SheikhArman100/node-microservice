import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';
import { IUser } from './user.interface';
import pick from '../../helpers/pick';
import { userFilterableFields } from './user.constant';
import { paginationFields } from '../../constant';
import { UserInfoFromToken } from '../../types/common';
import { IFile } from '../../interfaces/common';

// Note: User creation is handled by auth signup route, not here

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
     const filters = pick(req.query, userFilterableFields);
     const paginationOptions = pick(req.query, paginationFields);
    const result = await UserService.getAllUsers(filters,paginationOptions,req.user as UserInfoFromToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

const getUserByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getUserByID(Number(id),req.user as UserInfoFromToken);

    if (!result) {
        return sendResponse(res, {
            statusCode: status.NOT_FOUND,
            success: false,
            message: 'User not found',
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.updateUser(Number(id), req.body as Partial<IUser>, req.user as UserInfoFromToken,req.file as IFile);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});

const deleteUserByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await UserService.deleteUserByID(Number(id),req.user as UserInfoFromToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User deleted successfully',
        data: null,
    });
});

export const UserController = {
    getAllUsers,
    getUserByID,
    updateUser,
    deleteUserByID,
};
