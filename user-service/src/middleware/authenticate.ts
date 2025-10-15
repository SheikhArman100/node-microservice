import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { jwtHelpers } from '../helpers/jwtHelpers';
import config from '../config';

/**
 * Authentication middleware that verifies the presence and validity of a JWT token
 * and attaches the verified user data to the request object.
 *
 * This function checks the following:
 * 1. Retrieves the authorization token from the request headers.
 * 2. Validates that the token is present and correctly formatted as a "Bearer" token.
 * 3. Verifies the JWT token using the configured secret.
 * 4. Attaches the verified user data to the request object for downstream middleware or controllers.
 *
 * @returns {Function} An Express middleware function.
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization token
    const authHeader: any =
      req.headers.authorization || req.headers.Authorization;

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

    // Verify token
    let verifiedUser = null;

    verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.access_secret as Secret,
    );

    req.user = verifiedUser;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;