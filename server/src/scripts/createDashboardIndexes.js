import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const collections = [
  'sales',
  'returns', 
  'staff',
  'inventory',
  'shops'
];

async function createIndexes() {
  try {
    await db;
    
    console.log('🎯 Creating dashboard performance indexes...\n');
    
    // Sales indexes (critical for dashboard)
    await mongoose.connection.db.collection('sales').createIndexes([
      { key: { createdAt: -1, shopId: 1 } },
      { key: { shopId: 1, createdAt: -1 } },
      { key: { totalAmount: -1 } }
    ]);
    console.log('✅ Sales indexes created');
    
    // Returns
    await mongoose.connection.db.collection('returns').createIndexes([
      { key: { createdAt: -1, shopId: 1 } },
      { key: { shopId: 1 } }
    ]);
    console.log('✅ Returns indexes created');
    
    // Staff
    await mongoose.connection.db.collection('staff').createIndexes([
      { key: { shopId: 1, isActive: 1 } }
    ]);
    console.log('✅ Staff indexes created');
    
    // Inventory
    await mongoose.connection.db.collection('inventories').createIndexes([
      { key: { shopId: 1 } },
      { key: { productId: 1 } }
    ]);
    console.log('✅ Inventory indexes created');
    
    // Shops
    await mongoose.connection.db.collection('shops').createIndexes([
      { key: { isActive: 1 } }
    ]);
    console.log('✅ Shops indexes created');
    
    // Products (for lookups)
    await mongoose.connection.db.collection('products').createIndexes([
      { key: { name: 1 } }
    ]);
    console.log('✅ Products indexes created');
    
    console.log('\n🚀 Dashboard indexes complete! Expected 5-10x query speedup.');
    console.log('💡 Restart your server and test the dashboard.');
    
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createIndexes();
