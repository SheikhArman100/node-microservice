import { Product } from './product.model';
import { IProduct, IProductFilters } from './product.interface';
import { productSearchableFields } from './product.constant';
import { IGenericResponse, IPaginationOptions } from '../../../interfaces/common';
import { calculatePagination } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';

const createProduct = async (productData: Partial<IProduct>): Promise<IProduct | null> => {
    const result = await Product.create(productData);
    return result;
};

const getAllProducts = async (
    filters: IProductFilters,
    options: IPaginationOptions
): Promise<IGenericResponse<IProduct[]>> => {
    const { searchTerm, ...filterData } = filters;
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: productSearchableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            }))
        });
    }

    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([field, value]) => ({
                [field]: value
            }))
        });
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

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

const getProductByID = async (id: string): Promise<IProduct | null> => {
    const result = await Product.findById(id);
    return result;
};

const updateProduct = async (
    id: string,
    payload: Partial<IProduct>
): Promise<IProduct | null> => {
    const result = await Product.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );
    return result;
};

const deleteProductByID = async (id: string): Promise<IProduct | null> => {
    const result = await Product.findByIdAndDelete(id);
    return result;
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getProductByID,
    updateProduct,
    deleteProductByID,
};
