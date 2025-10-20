import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';


/**
 * Authorization middleware that checks if the authenticated user has the required permission.
 * User information is read from HTTP headers forwarded by the API Gateway.
 *
 * Headers expected:
 * - x-user-id: User ID
 * - x-user-email: User email
 * - x-user-role: User role
 * - x-user-permissions: JSON string of user permissions
 *
 * @param {ENUM_PERMISSION} requiredPermission - The permission required to access the route
 * @returns {Function} An Express middleware function.
 */
const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Read user info from headers (forwarded by gateway)
      const userId = req.headers['x-user-id'] as string;
      const userEmail = req.headers['x-user-email'] as string;
      const userRole = req.headers['x-user-role'] as string;
      const userRoleLevel = req.headers['x-user-role-level'] as string;
      const userPermissionsHeader = req.headers['x-user-permissions'] as string;

      // Check if all required headers are present
      if (!userId || !userEmail || !userRole || !userRoleLevel || !userPermissionsHeader) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Authentication required');
      }

      // Parse permissions from header
      let userPermissions: string[];
      try {
        userPermissions = JSON.parse(userPermissionsHeader);
      } catch (error) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid authentication data');
      }

      // Reconstruct user object from headers
      req.user = {
        id: parseInt(userId),
        email: userEmail,
        role: userRole,
        roleLevel: parseInt(userRoleLevel),
        permissions: userPermissions
      };

      // Check if user has the required permission
      if (!userPermissions.includes(requiredPermission)) {
        throw new ApiError(httpStatus.FORBIDDEN, `You don't have access to this route`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
