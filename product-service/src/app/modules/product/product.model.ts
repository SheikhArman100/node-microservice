import { Schema, model } from 'mongoose';
import { ProductModel, IProduct } from './product.interface';

const ProductSchema = new Schema<IProduct, ProductModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
        },
        imagelink: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required.'],
            min: [0, 'Stock cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Category is required.'],
            trim: true,
        },
        createdBy: {
            type: String,
            required: [true, 'Created by is required'],
        },
        updatedBy: {
            type: String,
            required: true,
            default: function () {
                return this.createdBy;
            },
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    },
);

// Add indexes for better performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdBy: 1 });
// Example: ProductSchema.index({ email: 1 });
// Example: ProductSchema.index({ status: 1 });

export const Product = model<IProduct, ProductModel>(
    'Product',
    ProductSchema,
);
