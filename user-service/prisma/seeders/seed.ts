import { PrismaClient } from '@prisma/client';

import { seedUsers } from './user.seed';
import { seedRoles } from './role.seed';
import { seedPermissions } from './permission.seed';
import { seedRolePermissions } from './rolePermission.seed';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting RBAC seeding...');

    // Seed RBAC system first
    await seedRoles();
    console.log('✅ Roles seeded');

    await seedPermissions();
    console.log('✅ Permissions seeded');

    await seedRolePermissions();
    console.log('✅ Role-Permission mappings seeded');

    // Then seed users
    await seedUsers();
    console.log('✅ Users seeded');

    console.log('\n🎉 All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });