export enum ENUM_ROLE {
  ADMIN = 'admin',
  USER = 'user'
}

export const ROLE_LEVELS = {
  [ENUM_ROLE.ADMIN]: 100,
  [ENUM_ROLE.USER]: 10,
} as const

export enum ENUM_PERMISSION {
  // User permissions
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  

}

// Role-permission mappings (easy to modify)
export const ROLE_PERMISSIONS = {
  [ENUM_ROLE.ADMIN]: [
    ENUM_PERMISSION.CREATE_USER,
    ENUM_PERMISSION.READ_USER,
    ENUM_PERMISSION.UPDATE_USER,
    ENUM_PERMISSION.DELETE_USER,
  ],
  [ENUM_ROLE.USER]: [
    ENUM_PERMISSION.READ_USER,
  ],
} as const