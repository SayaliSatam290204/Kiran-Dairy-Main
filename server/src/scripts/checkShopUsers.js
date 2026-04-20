import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const checkShopUsers = async () => {
    try {
        await connectDB();
        const shopUsers = await User.find({ role: 'shop' }, { name: 1, email: 1, phone: 1, role: 1 });
        console.log('Shop Users in Database:');
        console.log(JSON.stringify(shopUsers, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkShopUsers();
