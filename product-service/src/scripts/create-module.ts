import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide a module name.');
  process.exit(1);
}

const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const toCamelCase = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

const moduleNamePascal = toPascalCase(moduleName);
const moduleNameCamel = toCamelCase(moduleName);

const templates = {
  'interface.ts': `import { Model, Types } from "mongoose";

export type I{{MODULE_NAME_PASCAL}} = {
    name: string;
    // Example: email?: string;
    // Example: isActive: boolean;
    // Example: status: string;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId; 
}

export type {{MODULE_NAME_PASCAL}}Model = Model<
  I{{MODULE_NAME_PASCAL}},
  Record<string, unknown>
>;

export type I{{MODULE_NAME_PASCAL}}Filters = {
  searchTerm?: string;
  name?: string;
  // Example: email?: string;
  // Example: status?: string;
  // Example: isActive?: boolean;
};`,

  'constant.ts': `// Example type definitions
// export type {{MODULE_NAME_PASCAL}}Status = 'active' | 'inactive' | 'pending';
// export type {{MODULE_NAME_PASCAL}}Role = 'admin' | 'user' | 'moderator';

// Example constant arrays
// export const {{MODULE_NAME_CAMEL}}Statuses: {{MODULE_NAME_PASCAL}}Status[] = ['active', 'inactive', 'pending'];
// export const {{MODULE_NAME_CAMEL}}Roles: {{MODULE_NAME_PASCAL}}Role[] = ['admin', 'user', 'moderator'];

// Filter fields - add your filterable fields here
export const {{MODULE_NAME_CAMEL}}FilterableFields = [
    'searchTerm',
    'name',
    // Example: 'email',
    // Example: 'status',
    // Example: 'isActive',
];

// Search fields - add your searchable fields here
export const {{MODULE_NAME_CAMEL}}SearchableFields = [
    'name',
    // Example: 'email',
    // Example: 'description',
];`,

  'model.ts': `import { Schema, model } from 'mongoose';
import { {{MODULE_NAME_PASCAL}}Model, I{{MODULE_NAME_PASCAL}} } from './{{MODULE_NAME}}.interface';

const {{MODULE_NAME_PASCAL}}Schema = new Schema<I{{MODULE_NAME_PASCAL}}, {{MODULE_NAME_PASCAL}}Model>(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
        },
        // Example: email: {
        //     type: String,
        //     unique: true,
        //     required: [true, 'Email is required.'],
        //     lowercase: true,
        //     trim: true,
        // },
        // Example: status: {
        //     type: String,
        //     enum: {{MODULE_NAME_CAMEL}}Statuses,
        //     default: 'active',
        // },
        // Example: isActive: {
        //     type: Boolean,
        //     default: true,
        // },
        createdBy: {
            type: Schema.Types.ObjectId,
            required: [true, 'Created by is required'],
            ref: 'User',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
{{MODULE_NAME_PASCAL}}Schema.index({ name: 1 });
{{MODULE_NAME_PASCAL}}Schema.index({ createdBy: 1 });
// Example: {{MODULE_NAME_PASCAL}}Schema.index({ email: 1 });
// Example: {{MODULE_NAME_PASCAL}}Schema.index({ status: 1 });

export const {{MODULE_NAME_PASCAL}} = model<I{{MODULE_NAME_PASCAL}}, {{MODULE_NAME_PASCAL}}Model>(
    '{{MODULE_NAME_PASCAL}}',
    {{MODULE_NAME_PASCAL}}Schema,
);`,

  'service.ts': `import { {{MODULE_NAME_PASCAL}} } from './{{MODULE_NAME}}.model';
import { I{{MODULE_NAME_PASCAL}}, I{{MODULE_NAME_PASCAL}}Filters } from './{{MODULE_NAME}}.interface';
import { {{MODULE_NAME_CAMEL}}SearchableFields } from './{{MODULE_NAME}}.constant';
import { IGenericResponse, IPaginationOptions } from '../../../interfaces/common';
import { calculatePagination } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';

const create{{MODULE_NAME_PASCAL}} = async ({{MODULE_NAME_CAMEL}}Data: Partial<I{{MODULE_NAME_PASCAL}}>): Promise<I{{MODULE_NAME_PASCAL}} | null> => {
    // Example implementation:
    // const result = await {{MODULE_NAME_PASCAL}}.create({{MODULE_NAME_CAMEL}}Data);
    // return result;
    
    // Placeholder return - replace with actual implementation
    return null;
};

const getAll{{MODULE_NAME_PASCAL}}s = async (
    filters: I{{MODULE_NAME_PASCAL}}Filters,
    options: IPaginationOptions
): Promise<IGenericResponse<I{{MODULE_NAME_PASCAL}}[]>> => {
    // Example implementation:
    // const { searchTerm, ...filterData } = filters;
    // const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    
    // const andConditions = [];
    
    // if (searchTerm) {
    //     andConditions.push({
    //         $or: {{MODULE_NAME_CAMEL}}SearchableFields.map(field => ({
    //             [field]: { $regex: searchTerm, $options: 'i' }
    //         }))
    //     });
    // }
    
    // if (Object.keys(filterData).length) {
    //     andConditions.push({
    //         $and: Object.entries(filterData).map(([field, value]) => ({
    //             [field]: value
    //         }))
    //     });
    // }
    
    // const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    
    // const sortConditions: { [key: string]: SortOrder } = {};
    // if (sortBy && sortOrder) {
    //     sortConditions[sortBy] = sortOrder;
    // }
    
    // const result = await {{MODULE_NAME_PASCAL}}.find(whereConditions)
    //     .populate('createdBy', 'name email')
    //     .populate('updatedBy', 'name email')
    //     .sort(sortConditions)
    //     .skip(skip)
    //     .limit(limit);
    
    // const count = await {{MODULE_NAME_PASCAL}}.countDocuments(whereConditions);
    
    // return {
    //     meta: {
    //         page,
    //         limit,
    //         count,
    //     },
    //     data: result,
    // };
    
    // Placeholder return - replace with actual implementation
    return {
        meta: { page: 1, limit: 10, count: 0 },
        data: [],
    };
};

const get{{MODULE_NAME_PASCAL}}ByID = async (id: string): Promise<I{{MODULE_NAME_PASCAL}} | null> => {
    // Example implementation:
    // const result = await {{MODULE_NAME_PASCAL}}.findById(id)
    //     .populate('createdBy', 'name email')
    //     .populate('updatedBy', 'name email');
    // return result;
    
    // Placeholder return - replace with actual implementation
    return null;
};

const update{{MODULE_NAME_PASCAL}} = async (
    id: string, 
    payload: Partial<I{{MODULE_NAME_PASCAL}}>
): Promise<I{{MODULE_NAME_PASCAL}} | null> => {
    // Example implementation:
    // const result = await {{MODULE_NAME_PASCAL}}.findOneAndUpdate(
    //     { _id: id }, 
    //     payload, 
    //     { new: true }
    // ).populate('createdBy', 'name email')
    //  .populate('updatedBy', 'name email');
    // return result;
    
    // Placeholder return - replace with actual implementation
    return null;
};

const delete{{MODULE_NAME_PASCAL}}ByID = async (id: string): Promise<I{{MODULE_NAME_PASCAL}} | null> => {
    // Example implementation:
    // const result = await {{MODULE_NAME_PASCAL}}.findByIdAndDelete(id);
    // return result;
    
    // Placeholder return - replace with actual implementation
    return null;
};

export const {{MODULE_NAME_PASCAL}}Service = {
    create{{MODULE_NAME_PASCAL}},
    getAll{{MODULE_NAME_PASCAL}}s,
    get{{MODULE_NAME_PASCAL}}ByID,
    update{{MODULE_NAME_PASCAL}},
    delete{{MODULE_NAME_PASCAL}}ByID,
};`,

  'controller.ts': `import { Request, Response } from 'express';

import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { {{MODULE_NAME_PASCAL}}Service } from './{{MODULE_NAME}}.service';
import { {{MODULE_NAME_CAMEL}}FilterableFields } from './{{MODULE_NAME}}.constant';
import httpStatus from 'http-status';
import pick from '../../../helpers/pick';
import { paginationFields } from '../../../constant';

const create{{MODULE_NAME_PASCAL}} = catchAsync(async (req: Request, res: Response) => {
    // Example implementation:
    // const {{MODULE_NAME_CAMEL}}Data = {
    //     ...req.body,
    //     createdBy: req.user?._id,
    //     updatedBy: req.user?._id,
    // };
    // const result = await {{MODULE_NAME_PASCAL}}Service.create{{MODULE_NAME_PASCAL}}({{MODULE_NAME_CAMEL}}Data);
    
    const result = await {{MODULE_NAME_PASCAL}}Service.create{{MODULE_NAME_PASCAL}}(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: '{{MODULE_NAME_PASCAL}} created successfully',
        data: result,
    });
});

const getAll{{MODULE_NAME_PASCAL}}s = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, {{MODULE_NAME_CAMEL}}FilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    
    const result = await {{MODULE_NAME_PASCAL}}Service.getAll{{MODULE_NAME_PASCAL}}s(filters, paginationOptions);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: '{{MODULE_NAME_PASCAL}}s retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const get{{MODULE_NAME_PASCAL}}ByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await {{MODULE_NAME_PASCAL}}Service.get{{MODULE_NAME_PASCAL}}ByID(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single {{MODULE_NAME_PASCAL}} retrieved successfully',
        data: result,
    });
});

const update{{MODULE_NAME_PASCAL}} = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Example: const updateData = { ...req.body, updatedBy: req.user?._id };
    const result = await {{MODULE_NAME_PASCAL}}Service.update{{MODULE_NAME_PASCAL}}(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: '{{MODULE_NAME_PASCAL}} updated successfully',
        data: result,
    });
});

const delete{{MODULE_NAME_PASCAL}}ByID = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await {{MODULE_NAME_PASCAL}}Service.delete{{MODULE_NAME_PASCAL}}ByID(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: '{{MODULE_NAME_PASCAL}} deleted successfully',
        data: result,
    });
});

export const {{MODULE_NAME_PASCAL}}Controller = {
    create{{MODULE_NAME_PASCAL}},
    getAll{{MODULE_NAME_PASCAL}}s,
    get{{MODULE_NAME_PASCAL}}ByID,
    update{{MODULE_NAME_PASCAL}},
    delete{{MODULE_NAME_PASCAL}}ByID,
};`,

  'route.ts': `import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { {{MODULE_NAME_PASCAL}}Controller } from './{{MODULE_NAME}}.controller';
import { {{MODULE_NAME_PASCAL}}Validation } from './{{MODULE_NAME}}.validation';
// import auth from '../../../middlewares/auth';
// import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post(
    '/',
    // auth(ENUM_USER_ROLE.ADMIN), 
    validateRequest({{MODULE_NAME_PASCAL}}Validation.create{{MODULE_NAME_PASCAL}}ZodSchema), 
    {{MODULE_NAME_PASCAL}}Controller.create{{MODULE_NAME_PASCAL}}
);

router.get(
    '/',
    // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), 
    {{MODULE_NAME_PASCAL}}Controller.getAll{{MODULE_NAME_PASCAL}}s
);

router.get(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), 
    {{MODULE_NAME_PASCAL}}Controller.get{{MODULE_NAME_PASCAL}}ByID
);

router.patch(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN), 
    // validateRequest({{MODULE_NAME_PASCAL}}Validation.update{{MODULE_NAME_PASCAL}}ZodSchema), 
    {{MODULE_NAME_PASCAL}}Controller.update{{MODULE_NAME_PASCAL}}
);

router.delete(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN), 
    {{MODULE_NAME_PASCAL}}Controller.delete{{MODULE_NAME_PASCAL}}ByID
);

export const {{MODULE_NAME_PASCAL}}Routes = router;`,

  'validation.ts': `import { z } from 'zod';

const create{{MODULE_NAME_PASCAL}}ZodSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required',
        }).min(1, 'Name cannot be empty'),
        // Example: email: z.string({
        //     required_error: 'Email is required',
        // }).email('Invalid email format'),
        // Example: status: z.enum(['active', 'inactive'], {
        //     required_error: 'Status is required',
        // }),
    }),
});

const update{{MODULE_NAME_PASCAL}}ZodSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        // Example: email: z.string().email('Invalid email format').optional(),
        // Example: status: z.enum(['active', 'inactive']).optional(),
    }),
});

export const {{MODULE_NAME_PASCAL}}Validation = {
    create{{MODULE_NAME_PASCAL}}ZodSchema,
    update{{MODULE_NAME_PASCAL}}ZodSchema,
};`
};

const moduleDir = path.resolve(process.cwd(), 'src/app/modules', moduleName);

// Create directory if it doesn't exist
if (!fs.existsSync(moduleDir)) {
  fs.mkdirSync(moduleDir, { recursive: true });
  console.log(`Created directory: ${moduleDir}`);
}

// Generate files
for (const [fileType, template] of Object.entries(templates)) {
  const fileName = `${moduleName}.${fileType}`;
  const filePath = path.join(moduleDir, fileName);
  
  let fileContent = template
    .replace(/{{MODULE_NAME}}/g, moduleName)
    .replace(/{{MODULE_NAME_PASCAL}}/g, moduleNamePascal)
    .replace(/{{MODULE_NAME_CAMEL}}/g, moduleNameCamel);

  fs.writeFileSync(filePath, fileContent);
  console.log(`✅ Created: ${fileName}`);
}

console.log(`\n🎉 Module "${moduleName}" created successfully!`);