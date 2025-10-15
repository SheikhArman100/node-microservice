import { Model, Types } from "mongoose";

export type IProduct = {
    name: string;
    imagelink?: string;
    stock: number;
    category: string;
    createdBy: string;  // User ID as string from JWT
    updatedBy: string;  // User ID as string from JWT
}

export type ProductModel = Model<
  IProduct,
  Record<string, unknown>
>;

export type IProductFilters = {
  searchTerm?: string;
  name?: string;
  category?: string;
  stock?: number;
  // Example: email?: string;
  // Example: status?: string;
  // Example: isActive?: boolean;
};
