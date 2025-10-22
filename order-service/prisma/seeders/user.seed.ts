import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    id: '1',
    name: 'Demo Softograph',
    email: 'demo@softograph.com',
    phoneNumber: '+1234567890',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Amanullah Aman',
    email: 'aman@softograph.com',
    phoneNumber: '+1234567890',
    role: 'admin',
  },
  {
    id: '3',
    name: 'Sheikh Arman',
    email: 'sheikharman@softograph.com',
    phoneNumber: '+1234567890',
    role: 'admin',
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    role: 'user',
  },
  {
    id: '5',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+1234567891',
    role: 'user',
  }
];

export async function seedUsers() {
  try {
    console.log('Seeding users for order-service...');

    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user
      });
    }

    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}
