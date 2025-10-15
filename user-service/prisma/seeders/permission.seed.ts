import { PrismaClient } from '@prisma/client';
import { ENUM_PERMISSION } from '../../src/enum/rbac';

const prisma = new PrismaClient();

// Helper function to parse permission name into metadata
const parsePermissionName = (permissionName: string) => {
  const parts = permissionName.split('_');
  const action = parts[0]; // create, read, update, delete, export
  const resource = parts.slice(1).join('_'); // user, task, etc.

  // Generate description
  const actionText = action === 'export' ? 'Export' : action.charAt(0).toUpperCase() + action.slice(1);
  const resourceText = resource.replace('_', ' ').toUpperCase();
  const description = `${actionText} ${resourceText.toLowerCase()}${resourceText.endsWith('S') ? '' : 's'}`;

  return {
    resource,
    action,
    description
  };
};

export const seedPermissions = async () => {
  // Map directly from ENUM_PERMISSION by parsing the name
  const permissions = Object.values(ENUM_PERMISSION).map(permissionName => ({
    name: permissionName,
    ...parsePermissionName(permissionName)
  }));

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true
  });
};