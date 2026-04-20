import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';

const testInventoryPopulate = async () => {
    try {
        await connectDB();
        
        // Get the first shop
        const shop = await Shop.findOne({});
        console.log('First shop:', shop);
        
        if (!shop) {
            console.log('No shops found');
            process.exit(0);
        }
        
        // Get inventory for this shop WITH populate
        const inventory = await Inventory.find({ shopId: shop._id })
            .populate("productId", "name sku price category unit imageUrl")
            .sort({ createdAt: -1 });
        
        console.log('\n✅ Inventory with populate:');
        console.log(JSON.stringify(inventory, null, 2));
        
        // Also get without populate to compare
        const inventoryRaw = await Inventory.find({ shopId: shop._id });
        console.log('\n📦 Raw inventory (without populate):');
        console.log(JSON.stringify(inventoryRaw, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

testInventoryPopulate();
