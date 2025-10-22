

import { User } from '../app/modules/user/user.model';

const users = [
  {
    _id: '1',
    name: 'Demo Softograph',
    email: 'demo@softograph.com',
    role: 'admin',
  },
  {
    _id: '2',
    name: 'Amanullah Aman',
    email: 'aman@softograph.com',
    role: 'admin',
  },
  {
    _id: '3',
    name: 'Sheikh Arman',
    email: 'sheikharman@softograph.com',
    role: 'admin',
  },
  {
    _id: '4',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
  },
  {
    _id: '5',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
  }
];

export const seedUsers = async (): Promise<void> => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist in database. Skipping user seeder.');
      return;
    }

    // Create users
    for (const user of users) {
      const newUser = new User({
        ...user,
        lastUpdated: new Date()
      });
      await newUser.save();
    }
    console.log('User seeding completed successfully');

  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};
