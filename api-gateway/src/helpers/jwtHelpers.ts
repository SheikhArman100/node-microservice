import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { parseExpirationTime } from '../utils';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string,
): string => {
  
  return jwt.sign(payload, secret, {
    expiresIn: parseExpirationTime(expireTime),
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  try {
    const isVerified = jwt.verify(token, secret);
    return isVerified as any;
  } catch (error) {
    throw new ApiError(403, 'Invalid token');
  }
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
