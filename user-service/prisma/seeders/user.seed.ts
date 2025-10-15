import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import config from '../../src/config';
import { ENUM_ROLE } from '../../src/enum/rbac';


const prisma = new PrismaClient();

export async function seedUsers() {

  const defaultPassword = await bcrypt.hash(
      "123456" as string,
      10,
    );

  // Get role IDs from database (simplified approach)
  const existingRoles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(existingRoles.map(r => [r.name, r.id]));

  const users = [
    {
      name: 'Demo Softograph',
      email: 'demo@softograph.com',
      phoneNumber: '+1234567890',
      password: defaultPassword,
      isVerified: true,
      roleId: roleMap[ENUM_ROLE.ADMIN] 
    },
    {
      name: 'Amanullah Aman',
      email: 'aman@softograph.com',
      phoneNumber: '+1234567890',
      password: defaultPassword,
      isVerified: true,
      roleId: roleMap[ENUM_ROLE.ADMIN]
    },
    {
      name: 'Sheikh Arman',
      email: 'sheikharman@softograph.com',
      phoneNumber: '+1234567890',
      password: defaultPassword,
      isVerified: true,
      roleId: roleMap[ENUM_ROLE.ADMIN]
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      password: defaultPassword,
      isVerified: true,
      roleId: roleMap[ENUM_ROLE.USER],
      detail: {
        create: {
          address: '123 Main St',
          city: 'New York',
          road: 'Broadway'
        }
      }
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1234567891',
      password: defaultPassword,
      isVerified: true,
      roleId: roleMap[ENUM_ROLE.USER],
      detail: {
        create: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          road: 'Sunset Blvd'
        }
      }
    }

  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }
}