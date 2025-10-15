import { PrismaClient } from '@prisma/client';
import { ENUM_ROLE, ROLE_LEVELS } from '../../src/enum/rbac';

const prisma = new PrismaClient();

export const seedRoles = async () => {
  const roles = Object.values(ENUM_ROLE).map(roleName => ({
    name: roleName,
    level: ROLE_LEVELS[roleName as ENUM_ROLE],
    description: roleName.replace('_', ' ').toUpperCase(),
    isActive: true
  }));

  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true
  });
};