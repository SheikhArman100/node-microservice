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

  //product
  CREATE_PRODUCT='create_product',
  READ_PRODUCT="read_product",
  UPDATE_PRODUCT="update_product",
  DELETE_PRODUCT="delete_product",

  //order
  CREATE_ORDER = 'create_order',
  READ_ORDER = 'read_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order'

}

// Role-permission mappings (easy to modify)
export const ROLE_PERMISSIONS = {
  [ENUM_ROLE.ADMIN]: [
    ENUM_PERMISSION.CREATE_USER,
    ENUM_PERMISSION.READ_USER,
    ENUM_PERMISSION.UPDATE_USER,
    ENUM_PERMISSION.DELETE_USER,
    ENUM_PERMISSION.CREATE_PRODUCT,
    ENUM_PERMISSION.READ_PRODUCT,
    ENUM_PERMISSION.UPDATE_PRODUCT,
    ENUM_PERMISSION.DELETE_PRODUCT,
    ENUM_PERMISSION.CREATE_ORDER,
    ENUM_PERMISSION.READ_ORDER,
    ENUM_PERMISSION.UPDATE_ORDER,
    ENUM_PERMISSION.DELETE_ORDER
  ],
  [ENUM_ROLE.USER]: [
    ENUM_PERMISSION.READ_USER,
    ENUM_PERMISSION.READ_PRODUCT,
    ENUM_PERMISSION.READ_ORDER
  ],
} as const