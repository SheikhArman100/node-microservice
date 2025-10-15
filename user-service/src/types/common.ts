import { ENUM_ROLE } from "../enum/rbac";
import { DiskTypeEnum } from "../enum/user";

/**
 * All types of user roles
 */

  

/**
 * User information in JWT token
 */
export type UserInfoFromToken = {
  id: string; 
  role: ENUM_ROLE.ADMIN | ENUM_ROLE.USER;
  roleLevel: number;
  email:string,
  iat: number;
  exp: number;
};

/**
 * Image / video or any type of file description
 */
export type FileType = {
  diskType: DiskTypeEnum;
  path: string;
  originalName: string;
  modifiedName: string;
};