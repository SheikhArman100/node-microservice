import { Prisma } from '@prisma/client';
import { prisma } from '../../client';
import { calculatePagination } from '../../helpers/paginationHelper';
import { IFile, IPaginationOptions } from '../../interfaces/common';
import { IUser, IUserFilters } from './user.interface';
import { userSearchableFields } from './user.constant';
import { UserInfoFromToken } from '../../types/common';
import ApiError from '../../errors/ApiError';
import status from 'http-status';
import { publishUserEvent } from '../../shared/rabbitmq/userPublishEvents';

// Note: User creation is handled by auth service signup, not here

/**
 * Get all users with role-based filtering
 * - Admin (level >= 100): sees all users
 * - User (level <= 10): sees empty array
 * - Managers (11-99): see users with lower role levels
 */
const getAllUsers = async (
  filters: IUserFilters,
  paginationOptions: IPaginationOptions,
  authInfo:UserInfoFromToken
) => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, orderBy } = calculatePagination(paginationOptions);

  let whereConditions: Prisma.UserWhereInput = {};

  // Use role level from token instead of database query
  const currentUserRoleLevel = authInfo.roleLevel;

  // Apply automatic role-based filtering
  if (currentUserRoleLevel >= 100) {
    // No additional filters - sees everything
  }
  else if (currentUserRoleLevel <= 10) {
    whereConditions.id = { in: [] };
  }
  else {
    whereConditions.userRole = { level: { lt: currentUserRoleLevel } };
  }

  // Add search term condition if provided
  if (searchTerm) {
    whereConditions = {
      OR: userSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          // mode: 'insensitive',
        },
      })),
    };
  }

  // Add other filter conditions
  if (Object.keys(filtersData).length) {
    whereConditions = {
      ...whereConditions,
      AND: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    };
  }

  const count = await prisma.user.count({ where: whereConditions });

  const result = await prisma.user.findMany({
    where: whereConditions,
    orderBy,
    skip,
    take: limit,
    select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            userRole: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                    description: true
                }
            }
        }
  });

  return {
    meta: {
      page,
      limit: limit === 0 ? count : limit,
      count,
    },
    data: result,
  };
};

/**
 * Get user by ID with role-based access control
 * - Admin (level >= 100): can view any user
 * - User (level <= 10): cannot view user details
 * - Managers (11-99): can view users with lower role levels
 */
const getUserByID = async (id: number, authInfo: UserInfoFromToken) => {
    // First check if user exists
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            userRole: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                    description: true
                }
            },
            detail: {
                select: {
                    address: true,
                    city: true,
                    road: true,
                    image: {
                        select: {
                            path: true,
                            originalName: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(status.NOT_FOUND, "User not found");
    }

    const currentUserRoleLevel = authInfo.roleLevel;

    // Apply access control using role levels
    if (currentUserRoleLevel >= 100) {
        return user;
    }
    else if (currentUserRoleLevel <= 10) {
        throw new ApiError(status.FORBIDDEN, 'You can not view this profile.');
    }
    else {
        if (user.userRole && user.userRole.level < currentUserRoleLevel) {
            return user;
        }
        throw new ApiError(status.FORBIDDEN, 'Cannot view users at same or higher level');
    }
};

/**
 * Update user by ID
 * - Requires UPDATE_USER permission
 * - Admin can update any user
 * - Managers can update users with lower role levels
 */
const updateUser = async (
  id: number,
  payload: any,
  authInfo: UserInfoFromToken,
  multerFile?: IFile
) => {
  // First check if user exists and get their role level
  const userToUpdate = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      roleId: true,
      userRole: {
        select: {
          level: true,
          name: true,
        },
      },
      detail: {
        select: {
          id: true,
          image: {
            select: {
              id: true,
              path: true,
            },
          },
        },
      },
    },
  });

  if (!userToUpdate) {
    throw new ApiError(status.NOT_FOUND, 'User not found');
  }

  // Apply access control using role levels
  const currentUserRoleLevel = authInfo.roleLevel;
  if (currentUserRoleLevel >= 100) {
    // Admin can update any user
  } else if (currentUserRoleLevel <= 10) {
    // User can only update themselves
    if (authInfo.id.toString() !== id.toString()) {
      throw new ApiError(status.FORBIDDEN, 'You can only update your own profile');
    }
    // Users cannot change their own role
    if (payload.role) {
      throw new ApiError(status.FORBIDDEN, 'You cannot change your own role');
    }
  } else {
    
    if (!userToUpdate.userRole || userToUpdate.userRole.level >= currentUserRoleLevel) {
      throw new ApiError(status.FORBIDDEN, 'Cannot update users at same or higher level');
    }
  }

  // Get new role details if role is being updated
  let newRoleId = userToUpdate.roleId;
  if (payload.role) {
    const roleDetails = await prisma.role.findFirst({
      where: { name: payload.role },
    });
    if (!roleDetails) {
      throw new ApiError(status.BAD_REQUEST, 'Invalid role provided');
    }
    newRoleId = roleDetails.id;
  }

  // Check for duplicate email/phone if being updated
  if (payload.email || payload.phoneNumber) {
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } }, 
          {
            OR: [
              ...(payload.email ? [{ email: payload.email }] : []),
              ...(payload.phoneNumber ? [{ phoneNumber: payload.phoneNumber }] : []),
            ],
          },
        ],
      },
    });

    if (existingUser) {
      throw new ApiError(
        status.UNPROCESSABLE_ENTITY,
        'Email or PhoneNumber already exists'
      );
    }
  }

  // Use transaction to update user and related data
  const result = await prisma.$transaction(async (tx) => {
    // Update user
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.email && { email: payload.email }),
        ...(payload.phoneNumber && { phoneNumber: payload.phoneNumber }),
        ...(payload.isVerified !== undefined && { isVerified: payload.isVerified }),
        ...(payload.role && { roleId: newRoleId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isVerified: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        userRole: {
          select: {
            name: true,
          },
        },
      },
    });

    // Handle UserDetail updates (address, city, road, image)
    if (payload.address || payload.city || payload.road || multerFile) {
      // Check if UserDetail exists
      const existingDetail = await tx.userDetail.findUnique({
        where: { userId: id },
        select: {
          id: true,
          image: {
            select: {
              id: true,
              path: true,
            },
          },
        },
      });

      if (existingDetail) {
        // Update existing UserDetail
        const updateData: any = {
          ...(payload.address && { address: payload.address }),
          ...(payload.city && { city: payload.city }),
          ...(payload.road && { road: payload.road }),
        };

        // Handle image update
        if (multerFile) {
          if (existingDetail.image) {
            // Update existing image
            updateData.image = {
              update: {
                diskType: 'LOCAL',
                modifiedName: multerFile.filename,
                originalName: multerFile.originalname,
                path: `users/${multerFile.filename}`,
                type: 'IMAGE',
              },
            };
          } else {
            // Create new image
            updateData.image = {
              create: {
                diskType: 'LOCAL',
                modifiedName: multerFile.filename,
                originalName: multerFile.originalname,
                path: `users/${multerFile.filename}`,
                type: 'IMAGE',
              },
            };
          }
        }

        await tx.userDetail.update({
          where: { userId: id },
          data: updateData,
        });
      } else {
        // Create new UserDetail
        const createData: any = {
          userId: id,
          ...(payload.address && { address: payload.address }),
          ...(payload.city && { city: payload.city }),
          ...(payload.road && { road: payload.road }),
        };

        if (multerFile) {
          createData.image = {
            create: {
              diskType: 'LOCAL',
              modifiedName: multerFile.filename,
              originalName: multerFile.originalname,
              path: `users/${multerFile.filename}`,
              type: 'IMAGE',
            },
          };
        }

        await tx.userDetail.create({
          data: createData,
        });
      }
    }

    return updatedUser;
  });

  // Publish user updated event
  try {
    await publishUserEvent('user.updated', {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.userRole?.name ?? 'user',
      phoneNumber: result.phoneNumber,
    });
  } catch (error) {
    console.error('Failed to publish user updated event', { error, userId: result.id });
  }

  return result;
};

/**
 * Delete user by ID
 * - Requires DELETE_USER permission
 * - Admin can delete any user
 * - Managers can delete users with lower role levels
 */
const deleteUserByID = async (id: number, authInfo: UserInfoFromToken) => {
    // First check if user exists and get their role level
    const userToDelete = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            userRole: {
                select: {
                    level: true
                }
            }
        }
    });

    if (!userToDelete) {
        throw new ApiError(status.NOT_FOUND, "User not found");
    }

    // Apply access control using role levels
    const currentUserRoleLevel = authInfo.roleLevel;
    if (currentUserRoleLevel >= 100) {
        // Admin can delete any user
    }
    else if (currentUserRoleLevel <= 10) {
        // User cannot delete anyone
        throw new ApiError(status.FORBIDDEN, 'You cannot delete users.');
    }
    else {
        // Managers can only delete users with lower role levels
        if (!userToDelete.userRole || userToDelete.userRole.level >= currentUserRoleLevel) {
            throw new ApiError(status.FORBIDDEN, 'Cannot delete users at same or higher level');
        }
    }

    const result = await prisma.user.delete({
        where: { id }
    });
    return result;
};

export const UserService = {
    getAllUsers,
    getUserByID,
    updateUser,
    deleteUserByID,
};
