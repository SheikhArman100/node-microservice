import { ENUM_ROLE } from "../../enum/rbac";



export interface IUser {
    id?: number;
    name: string;
    email: string;
    phoneNumber: string;
    password?: string;
    role?: ENUM_ROLE;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface IUserFilters {
    searchTerm?: string;
    role?: string;
    email?: string;
  }
