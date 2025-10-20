import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../../errors/ApiError';
import config from '../../config';
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helpers/jwtHelpers';

export interface IAuthUser {
  id: number;
  email: string;
  role: string;
  roleLevel?: number;
  permissions: string[];
}

/**
 * Authentication middleware for API Gateway that validates JWT tokens
 * and forwards user information to downstream services via headers.
 *
 * This middleware:
 * 1. Validates JWT token from Authorization header
 * 2. Extracts user information from token
 * 3. Forwards user data via HTTP headers to services
 *
 * Headers forwarded:
 * - x-user-id: User ID
 * - x-user-email: User email
 * - x-user-role: User role
 * - x-user-role-level: User role level
 * - x-user-permissions: JSON string of user permissions
 */
export const authenticateAndForward = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization token
    const authHeader:any = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Invalid token format'
      );
    }

    // Verify JWT
    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt.access_secret as Secret,
    );

    // Validate decoded token has required fields
    if (!decoded.id || !decoded.email || !decoded.role || !Array.isArray(decoded.permissions)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token payload');
    }

    // Add user info to request headers (will be forwarded to service)
    req.headers['x-user-id'] = decoded.id.toString();
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-role-level'] = (decoded.roleLevel || 10).toString();
    req.headers['x-user-permissions'] = JSON.stringify(decoded.permissions);

    next();
  } catch (error) {
    next(error)
  }
};
