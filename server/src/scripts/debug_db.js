import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const checkUsers = async () => {
    try {
        await connectDB();
        const count = await User.countDocuments({});
        const users = await User.find({}, { email: 1, name: 1 });
        console.log(`User Count: ${count}`);
        console.log('Users:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
