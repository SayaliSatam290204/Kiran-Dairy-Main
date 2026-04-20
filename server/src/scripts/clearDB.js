import mongoose from 'mongoose';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
import connectDB from '../config/db.js';

// Models
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Unit from '../models/Unit.js';
import Shop from '../models/Shop.js';
import Staff from '../models/Staff.js';
import Dispatch from '../models/Dispatch.js';
import Sale from '../models/Sale.js';
import Return from '../models/Return.js';
import Inventory from '../models/Inventory.js';
import StockLedger from '../models/StockLedger.js';
import StaffPayment from '../models/StaffPayment.js';

const clearAndSeedBasics = async () => {
    try {
        await connectDB();
        const log = (msg) => {
            console.log(msg);
            fs.appendFileSync('clear_log.txt', msg + '\n');
        };
        log('[INIT] Connected to database. Starting cleanup...');

        // Drop all indexes first
        const models = [
            User, Product, Category, Unit, Shop, Staff,
            Dispatch, Sale, Return, Inventory, StockLedger, StaffPayment
        ];

        for (const model of models) {
            // Drop all indexes first
            try {
                await model.collection.dropIndexes();
            } catch (e) {
                // Ignore errors if no indexes exist
            }
            await model.deleteMany({});
            log(`[CLEAR] Cleared ${model.modelName} collection`);
        }

        // Seed default Units
        const defaultUnits = [
            { name: 'liter', shortName: 'L' },
            { name: 'kg', shortName: 'KG' },
            { name: 'piece', shortName: 'PC' },
            { name: 'dozen', shortName: 'DZ' }
        ];
        await Unit.insertMany(defaultUnits);
        log('[✓] Default Units seeded');

        // Seed default Categories
        const defaultCategories = [
            { name: 'Liquid Milk' },
            { name: 'Fermented Products' },
            { name: 'Fat-rich Products' },
            { name: 'Cheese & Paneer' },
            { name: 'Sweet Products' },
            { name: 'Frozen Dairy' },
            { name: 'Powdered Dairy' },
            { name: 'Value-added / Flavored' }
        ];
        await Category.insertMany(defaultCategories);
        log('[✓] Default Categories seeded');

        // Create Admin User
        const hashedPassword = await bcryptjs.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@kiran-dairy.com',
            password: hashedPassword,
            role: 'admin'
        });
        log('[ADMIN] Admin user created (admin@kiran-dairy.com / admin123)');

        // Create Super Admin User
        const superAdminPassword = await bcryptjs.hash('Shree@45', 10);
        await User.create({
            name: 'Swaroop Jadhav',
            email: 'swaroopjadhav6161@gmail.com',
            password: superAdminPassword,
            role: 'super-admin'
        });
        log('[SUPER-ADMIN] Super Admin user created (swaroopjadhav6161@gmail.com / Shree@45)');

        log('\n[SUCCESS] Database reset and basic seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database reset:', error);
        process.exit(1);
    }
};

clearAndSeedBasics();
