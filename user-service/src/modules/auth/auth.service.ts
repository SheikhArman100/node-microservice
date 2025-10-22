import bcrypt, { compare } from 'bcrypt';
import status from 'http-status';
import { Secret } from 'jsonwebtoken';
import { prisma } from '../../client';

import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import { sendEmail } from '../../helpers/nodeMailer';
import { parseExpirationTime } from '../../utils';
import { IUser } from '../user/user.interface';
import { IFile } from '../../interfaces/common';
import logger from '../../logger/logger';
import { UserInfoFromToken } from '../../types/common';
import { ENUM_ROLE, ROLE_PERMISSIONS } from '../../enum/rbac';
import config from '../../config';
import { publishUserEvent } from '../../shared/rabbitmq/userEvents';

//signup
const signup = async (payload: IUser, multerFile?: IFile) => {
  //check existing user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { phoneNumber: payload.phoneNumber }],
    },
  });
  if (existingUser) {
    throw new ApiError(
      status.UNPROCESSABLE_ENTITY,
      'Email or PhoneNumber already exists',
    );
  }

  // Hash the password
  if (!payload.password) {
    throw new ApiError(status.BAD_REQUEST, 'Password is required');
  }
  const hashedPassword = await bcrypt.hash(
    payload.password as string,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  // Get role ID from database based on role string
  let roleId: number | undefined;
  if (payload.role) {
    const roleEnumValue = payload.role === 'admin' ? ENUM_ROLE.ADMIN : ENUM_ROLE.USER;
    const roleRecord = await prisma.role.findFirst({
      where: { name: roleEnumValue }
    });
    if (roleRecord) {
      roleId = roleRecord.id;
    }
  }

  // Create user with roleId
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: hashedPassword,
      isVerified: false,
      roleId: roleId,
    },
  });
  if (!newUser) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Signup failed!!!');
  }

  // Handle profile image if provided
  if (multerFile) {
    // Create UserDetail with nested File creation
    await prisma.userDetail.create({
      data: {
        userId: newUser.id,
        image: {
          create: {
            diskType: 'LOCAL',
            modifiedName: multerFile.filename,
            originalName: multerFile.originalname,
            path: `users/${multerFile.filename}`,
            type: 'IMAGE',
          },
        },
      },
    });
  }

  // Get user with role for JWT token
  const userWithRole = await prisma.user.findUnique({
    where: { id: newUser.id },
    include: { userRole: true }
  });

  //send verifyToken
  const emailVerifyToken = jwtHelpers.createToken(
    {
      id: userWithRole!.id,
      email: userWithRole!.email,
      role: userWithRole!.userRole?.name || 'user', // Use role name from relation
    },
    config.jwt.email_verify_secret as Secret,
    config.jwt.email_verify_expires_in as string,
  );
  // Send Email Verification Link
  sendEmail(
    userWithRole!.email,
    `
    <div>
      <p>Hi, ${userWithRole!.name}</p>
      <p>Welcome! Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${config.admin_client_url}/auth/verify-email?token=${emailVerifyToken}">
          Verify Email
        </a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, you can ignore this email.</p>
      <p>Thank you!</p>
    </div>
    `,
    'Verify Your Email',
  );

  // Publish user created event
  try {
    await publishUserEvent('user.created', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber || undefined,
      isVerified: newUser.isVerified,
    });
  } catch (error) {
    logger.error('Failed to publish user created event', { error, userId: newUser.id });
    // Don't fail signup if event publishing fails
  }

  return {
    id: newUser.id,
  };
};

//verify email
const verifyEmail = async (token: string) => {
  let verifiedUser = null;

  verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.email_verify_secret as Secret,
  );

  const user = await prisma.user.findUnique({
    where: { email: verifiedUser.email },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found!');
  }

  const updatedUser = await prisma.user.update({
    where: { email: verifiedUser.email },
    data: { isVerified: true },
  });
  return updatedUser;
};

//resend verification
const resendVerification = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRole: true }
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, 'User not found!');
  }

  if (user.isVerified) {
    throw new ApiError(status.BAD_REQUEST, 'Email is already verified.');
  }

  // Generate new verification token
  const emailVerifyToken = jwtHelpers.createToken(
    {
      id: user.id,
      email: user.email,
      role: user.userRole?.name || 'user',
    },
    config.jwt.email_verify_secret as Secret,
    config.jwt.email_verify_expires_in as string,
  );

  // Send Email Verification Link
  sendEmail(
    user.email,
    `
    <div>
      <p>Hi, ${user.name}</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${config.admin_client_url}/auth/verify-email?token=${emailVerifyToken}">
          Verify Email
        </a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>Thank you!</p>
    </div>
    `,
    'Verify Your Email',
  );

  return {
    id: user.id,
  };
};

//signin
const signin = async (
  payload: { email: string; password: string }
) => {
  const { email, password } = payload;

  // Find user in database with role
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRole: true }
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User doesn't exist.");
  }

  if (!user.isVerified) {
    throw new ApiError(status.FORBIDDEN, 'Your account is not verified');
  }

  // Verify password using bcrypt
  const isPasswordValid = compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(status.UNPROCESSABLE_ENTITY, 'Password is incorrect.');
  }

  // Get user permissions based on role
  const userRole = user.userRole?.name as ENUM_ROLE || ENUM_ROLE.USER;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // Generate Access Token with permissions and roleLevel
  const accessToken = jwtHelpers.createToken(
    {
      id: user.id,
      email: user.email,
      role: userRole,
      roleLevel: user.userRole?.level || 10,
      permissions: [...permissions] 
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  // Generate Refresh Token with permissions and roleLevel
  const refreshToken = jwtHelpers.createToken(
    {
      id: user.id,
      role: userRole,
      roleLevel: user.userRole?.level || 10,
      permissions: [...permissions] 
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  // Store refresh token in DB
  const refreshExpiresIn = Number(
    parseExpirationTime(config.jwt.refresh_expires_in as string),
  );
  const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
 
  const result = await prisma.refreshToken.upsert({
  where: {
    userId: user.id,
  },
  update: {
    token: refreshToken,
    expiresAt,
  },
  create: {
    token: refreshToken,
    userId: user.id,
    expiresAt,
  },
});

if (!result) {
  throw new ApiError(status.BAD_REQUEST, "Failed to sign in");
}
  return {
    accessToken,
    refreshToken,
    id: user.id,
  };
};

//updated  token
const updateToken = async (refreshToken: string) => {
  const foundToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
    include: { user: { include: { userRole: true } } },
  });
  if (!foundToken) {
    throw new ApiError(status.UNAUTHORIZED, 'You are not authorized');
  }

  const verifiedUser = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_secret as Secret,
  );

  if (verifiedUser.id.toString() !== foundToken.userId.toString()) {
    throw new ApiError(status.UNAUTHORIZED, 'You are not authorized');
  }

  // Get user permissions based on role
  const userRole = foundToken.user.userRole?.name as ENUM_ROLE || ENUM_ROLE.USER;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // Generate new Access Token with permissions and roleLevel
  const newAccessToken = jwtHelpers.createToken(
    {
      id: foundToken.user.id,
      email: foundToken.user.email,
      role: userRole,
      roleLevel: foundToken.user.userRole?.level || 10,
      permissions: [...permissions] // Include permissions in JWT
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  // Generate new Refresh Token with permissions and roleLevel
  const newRefreshToken = jwtHelpers.createToken(
    {
      id: foundToken.user.id,
      role: userRole,
      roleLevel: foundToken.user.userRole?.level || 10,
      permissions: [...permissions] // Include permissions in refresh token too
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  // Update refresh token in DB
  const refreshExpiresIn = Number(
    parseExpirationTime(config.jwt.refresh_expires_in as string),
  );
  const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

  await prisma.refreshToken.update({
    where: { id: foundToken.id },
    data: { token: newRefreshToken, expiresAt },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    role: foundToken.user.userRole?.name || 'user',
  };
};

//sign out
const signOut = async (refreshToken: string) => {
  // Check if refresh token exists in DB
  const foundToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  });

  if (!foundToken) {
    throw new ApiError(status.UNAUTHORIZED, 'Invalid Refresh Token');
  }

  // Delete the refresh token
  const result = await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

 if(!result){
  throw new ApiError(status.BAD_REQUEST,"Failed to signout")
 }
 
};

//check user
const checkUser = async (refreshToken: string) => {
  const checkToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
    include: {
      user: {
        include: { userRole: true }
      }
    }
  });

  if (!checkToken) {
    throw new ApiError(status.UNAUTHORIZED, 'You are not authorized');
  }

  const verifiedUser = jwtHelpers.verifyToken(
    refreshToken,
    config.jwt.refresh_secret as Secret,
  );
  console.log("verified user",verifiedUser)
  console.log("check token",checkToken)

  if (verifiedUser.id.toString() !== checkToken.userId.toString()) {
    throw new ApiError(status.UNAUTHORIZED, 'You are not authorized');
  }

  return {
    id: checkToken.user.id,
    email: checkToken.user.email,
    role: checkToken.user.userRole?.name || 'user',
    isVerified: checkToken.user.isVerified,
  };
};
export const AuthService = {
  signup,
  verifyEmail,
  resendVerification,
  signin,
  updateToken,
  signOut,
  checkUser,
};
