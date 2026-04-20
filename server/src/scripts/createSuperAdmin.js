import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from 'dotenv';

config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super-admin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:');
      console.log({
        id: existingSuperAdmin._id,
        email: existingSuperAdmin.email,
        name: existingSuperAdmin.name
      });
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const password = 'Shree@45';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = new User({
      name: 'Swaroop Jadhav',
      email: 'swaroopjadhav6161@gmail.com',
      password: hashedPassword,
      role: 'super-admin',
      isActive: true
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log({
      id: superAdmin._id,
      email: superAdmin.email,
      name: superAdmin.name,
      role: superAdmin.role,
      password: password,
      message: 'Use these credentials to login'
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating super admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
