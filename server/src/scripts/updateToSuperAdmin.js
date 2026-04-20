import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from 'dotenv';

config();

async function updateToSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'swaroopjadhav6161@gmail.com';
    const password = 'Shree@45';

    // Find existing user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      await mongoose.disconnect();
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user to super-admin
    user.role = 'super-admin';
    user.password = hashedPassword;
    user.name = 'Swaroop Jadhav';
    user.isActive = true;

    await user.save();

    console.log('[✓] User updated to Super Admin successfully!');
    console.log({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      credentials: {
        email: email,
        password: password
      }
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateToSuperAdmin();
