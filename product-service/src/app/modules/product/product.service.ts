import { Product } from './product.model';
import { User } from '../user/user.model';
import { IProduct, IProductFilters } from './product.interface';
import { productSearchableFields } from './product.constant';
import {
  IGenericResponse,
  IPaginationOptions,
  UserInfoFromToken,
} from '../../../interfaces/common';
import { calculatePagination } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import status from 'http-status';
import { publishProductEvent } from '../../../shared/rabbitmq/eventPublisher';

const createProduct = async (
  productData: Partial<IProduct>,
  userInfo: UserInfoFromToken,
): Promise<IProduct | null> => {
  const result = await Product.create({
    name: productData.name,
    imagelink: productData.imagelink,
    category: productData.category,
    stock: productData.stock,
    createdBy: userInfo.id,
  });
  if (!result) {
    throw new ApiError(status.BAD_REQUEST, 'Failed to create product');
  }

  // Publish product created event
  await publishProductEvent('product.created', {
    id: result._id.toString(),
    name: result.name,
    imagelink: result.imagelink,
    stock: result.stock,
    category: result.category,
    createdBy: result.createdBy.toString(),
    updatedBy: result.updatedBy.toString(),
  });

  return result;
};

const getAllProducts = async (
  filters: IProductFilters,
  options: IPaginationOptions,
): Promise<IGenericResponse<IProduct[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: productSearchableFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const result = await Product.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const count = await Product.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      count,
    },
    data: result,
  };
};

const getProductByID = async (id: string): Promise<any> => {
  const product = await Product.findById(id);
  if (!product) {
    return null;
  }

  // Populate user data from cache
  const userCache = await User.findById(product.createdBy);
  const user = userCache
    ? {
        id: userCache._id,
        name: userCache.name,
        email: userCache.email,
      }
    : null;

  // Return product with populated user data
  return {
    ...product.toObject(),
    createdByUser: user,
  };
};

const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
  userInfo: UserInfoFromToken,
): Promise<IProduct | null> => {
  // Get the original product to check what changed
  const originalProduct = await Product.findById(id);
  if (!originalProduct) {
    throw new ApiError(status.NOT_FOUND, 'Product not found');
  }

  const result = await Product.findOneAndUpdate({ _id: id }, {
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.imagelink !== undefined && { imagelink: payload.imagelink }),
    ...(payload.stock !== undefined && { stock: payload.stock }),
    ...(payload.category !== undefined && { category: payload.category }),
    updatedBy: userInfo.id,
  }, {
    new: true,
  });
  if (!result) {
    throw new ApiError(status.BAD_REQUEST, 'Failed to update product');
  }

 // Check if only stock was updated
    const stockOnlyChanged =
      payload.stock !== undefined &&
      payload.stock !== originalProduct.stock &&
      Object.keys(payload).length === 2 && 
      payload.updatedBy !== undefined;

    if (stockOnlyChanged) {
      // Publish inventory changed event
     await publishProductEvent('inventory.changed', {
          id: result._id.toString(),
          name: result.name,
          imagelink: result.imagelink,
          stock: result.stock,
          category: result.category,
          createdBy: result.createdBy.toString(),
          updatedBy: result.updatedBy.toString(),
        });
    } else {
      // Publish general product updated event
     await publishProductEvent('product.updated', {
          id: result._id.toString(),
          name: result.name,
          imagelink: result.imagelink,
          stock: result.stock,
          category: result.category,
          createdBy: result.createdBy.toString(),
          updatedBy: result.updatedBy.toString(),
        });
    }

 
  return result;
};

const deleteProductByID = async (id: string): Promise<IProduct | null> => {
  // Get product data before deletion for event publishing
  const productToDelete = await Product.findById(id);
  if (!productToDelete) {
    throw new ApiError(status.NOT_FOUND, 'Product not found');
  }

  const result = await Product.findByIdAndDelete(id);

  if (result) {
    // Publish product deleted event
    try {
      await publishProductEvent('product.deleted', {
        id: result._id.toString(),
        name: result.name,
        imagelink: result.imagelink,
        stock: result.stock,
        category: result.category,
        createdBy: result.createdBy.toString(),
        updatedBy: result.updatedBy.toString(),
      });
    } catch (error) {
      console.error('Failed to publish product deleted event', {
        error,
        productId: result._id,
      });
    }
  }

  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductByID,
  updateProduct,
  deleteProductByID,
};
