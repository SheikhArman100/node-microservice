import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { ENUM_PERMISSION, ROLE_PERMISSIONS, ENUM_ROLE } from '../enum/rbac';
import { prisma } from '../client';

/**
 * Authorization middleware that checks if the authenticated user has the required permission
 * based on their role using explicit role-permission mapping.
 *
 * This function accepts a required permission and returns an Express middleware function
 * that checks the following:
 * 1. Ensures user is authenticated (req.user exists)
 * 2. Gets user's role from database
 * 3. Looks up permissions in ROLE_PERMISSIONS config
 * 4. Checks if required permission is in the user's permission list
 *
 * @param {ENUM_PERMISSION} requiredPermission - The permission required to access the route
 * @returns {Function} An Express middleware function.
 */
const authorize = (requiredPermission: ENUM_PERMISSION) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      const userId = req.user.id;

      // Get user permissions from database
      const userPermissions = await getUserPermissions(userId);

      // Check if user has the required permission
      if (!userPermissions.includes(requiredPermission)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this route');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Retrieves all permissions for a user based on their role.
 * Uses explicit role-permission mapping from ROLE_PERMISSIONS config.
 *
 * @param {number} userId - The user's ID
 * @returns {Promise<string[]>} Array of permission names the user has
 */
const getUserPermissions = async (userId: number): Promise<string[]> => {
  // Get user with their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRole: true }
  });

  if (!user?.userRole?.name) {
    return [];
  }

  // Get permissions directly from ROLE_PERMISSIONS config (no hierarchy)
  const roleName = user.userRole.name as ENUM_ROLE;
  const permissions = ROLE_PERMISSIONS[roleName] || [];
  return [...permissions]; // Convert readonly array to mutable array
};

export default authorize;