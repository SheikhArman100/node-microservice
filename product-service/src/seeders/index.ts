import mongoose from 'mongoose';


import config from '../config';
import { seedUsers } from './userSeeder';



const MONGODB_URI = config.mongodb_uri ??""

const runSeeders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log(' Database connection established');
    

    // Run seeders
    await seedUsers();
    console.log(' All seeders completed successfully');
    

    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error running seeders:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runSeeders();