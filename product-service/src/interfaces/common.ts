import { Types } from 'mongoose';

import { IGenericErrorMessages } from './error';
import { ENUM_USER_ROLE } from '../enum';

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessages[];
};

/**
 * Pagination options for calculate pagination data
 */
export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * Response data formate
 * @template T the response's main data type
 */
export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    count: number;
  };
  data: T;
};

export type UserRole = 'user' | 'admin' 

/**
 * User information in jwt token
 */
export type UserInfoFromToken = {
  id: string; 
  role: ENUM_USER_ROLE.ADMIN|ENUM_USER_ROLE.USER
  roleLevel: number;
  email:string,
  iat: number;
  exp: number;
};

/**
 * File stored location
 * @group Enum
 */
// export type DiskTypeEnum = 'local' | 'aws' | 'social';

/**
 * Image / video or any type of file description
 */
export type FileType = {
  diskType: "LOCAL";
  path: string;
  originalName: string;
  modifiedName: string;
};
export type IFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};
