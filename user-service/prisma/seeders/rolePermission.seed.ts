import { PrismaClient } from '@prisma/client';
import { ENUM_ROLE, ROLE_PERMISSIONS, ENUM_PERMISSION } from '../../src/enum/rbac';

const prisma = new PrismaClient();

export const seedRolePermissions = async () => {
  // Get role and permission IDs
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));
  const permissionMap = Object.fromEntries(permissions.map(p => [p.name, p.id]));

  // Use centralized ROLE_PERMISSIONS from rbac.ts
  const rolePermissions = Object.entries(ROLE_PERMISSIONS).flatMap(([roleName, permissions]) => {
    const roleId = roleMap[roleName as ENUM_ROLE];
    if (!roleId) return [];

    return permissions.map(permission => ({
      roleId,
      permissionId: permissionMap[permission]
    })).filter(mapping => mapping.permissionId); // Filter out undefined permissions
  });

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true
  });
};