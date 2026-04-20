import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const checkAllUsers = async () => {
    try {
        await connectDB();
        const allUsers = await User.find({}, { name: 1, email: 1, phone: 1, role: 1, isActive: 1 });
        console.log('All Users in Database:');
        console.log(JSON.stringify(allUsers, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAllUsers();
