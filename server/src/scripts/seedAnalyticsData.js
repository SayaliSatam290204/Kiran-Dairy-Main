import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Sale from '../models/Sale.js';
import Shop from '../models/Shop.js';
import Dispatch from '../models/Dispatch.js';
import Inventory from '../models/Inventory.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import StaffPayment from '../models/StaffPayment.js';
import { generateBillNo } from '../utils/generateBillNo.js';
import { generateDispatchNo } from '../utils/generateDispatchNo.js';
import connectDB from '../config/db.js';

const seedAnalyticsData = async () => {
  try {
    console.log('[ANALYTICS-SEED] Starting analytics data generation...');
    await connectDB();
    console.log('[✓] Connected to database\n');

    // Get existing data (APPEND MODE)
    const products = await Product.find({ isActive: true });
    const shops = await Shop.find({ isActive: true });
    const adminUser = await User.findOne({ role: 'admin' });

    if (products.length === 0 || shops.length === 0) {
      console.log('❌ Need products and shops first. Run seedDemoData.js');
      process.exit(1);
    }

    console.log(`[INFO] Found ${products.length} products, ${shops.length} shops`);

    // ==================== CREATE 2 NEW SHOPS ====================
    console.log('[SHOPS] Adding 2 new branches if missing...');
    
    const existingWest = await Shop.findOne({ name: 'Kiran Dairy West Market' });
    const existingNorth = await Shop.findOne({ name: 'Kiran Dairy North Hub' });
    
    let newShops = [];
    if (!existingWest) {
      const westShop = await Shop.create({
        name: 'Kiran Dairy West Market',
        location: 'West Market, Pune',
        ownerName: 'Vijay Patil',
        contactNo: '9876543213',
        email: 'west@kirandairy.com',
        address: 'West Market, Pune 411001',
        isActive: true
      });
      newShops.push(westShop);
    }
    if (!existingNorth) {
      const northShop = await Shop.create({
        name: 'Kiran Dairy North Hub',
        location: 'North Pune',
        ownerName: 'Neha Gupta',
        contactNo: '9876543214',
        email: 'north@kirandairy.com',
        address: 'North Main Road, Pune 411005',
        isActive: true
      });
      newShops.push(northShop);
    }

    const allShops = [...shops, ...newShops];

    console.log(`[✓] Total 5 shops ready\n`);

    // ==================== CREATE SHOP USERS FOR NEW SHOPS ====================
    // Only create users for newly created shops
    if (newShops.length > 0) {
      const shopPassword = await bcryptjs.hash('demo123', 10);
      const userData = [];
      
      if (newShops[0]) {
        userData.push({
          name: 'Vijay Patil',
          phone: 'Kiran Dairy West Market',
          email: 'west@kirandairy.com',
          password: shopPassword,
          role: 'shop',
          shopId: newShops[0]._id,
          isActive: true
        });
      }
      if (newShops[1]) {
        userData.push({
          name: 'Neha Gupta',
          phone: 'Kiran Dairy North Hub',
          email: 'north@kirandairy.com',
          password: shopPassword,
          role: 'shop',
          shopId: newShops[1]._id,
          isActive: true
        });
      }
      
      if (userData.length > 0) {
        await User.insertMany(userData);
        console.log(`[✓] Created ${userData.length} new shop users`);
      }
    }

    // ==================== CREATE 5 STAFFS PER SHOP ====================
    console.log('[STAFF] Creating staff...');
    const staffNames = ['Ramesh Kumar', 'Sita Devi', 'Rajesh M.', 'Priya S.', 'Vijay P.'];
    const staffData = [];
    
    for (let i = 0; i < allShops.length; i++) {
      const shopId = allShops[i]._id;
      staffNames.forEach((name, j) => {
        const email = `${name.toLowerCase().replace(/\\s+/g, '')}-${i}-${j}@staff.local`;
        staffData.push({
          updateOne: {
            filter: { email },
            update: {
              upsert: true,
              $setOnInsert: {
                name,
                email,
                phone: `98${700000000 + i * 10 + j}`,
                shopId,
                baseSalary: 15000 + Math.floor(Math.random() * 5000),
                status: 'active',
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                createdBy: adminUser._id,
                isActive: true
              }
            }
          }
        });
      });
    }
    
    if (staffData.length > 0) {
      await Staff.bulkWrite(staffData);
      console.log(`[✓] Upserted ${staffData.length} staff records`);
    }
    console.log(`[✓] Created 25 staff members\n`);

    // ==================== DISPATCHES TO ALL 5 SHOPS ====================
    console.log('[DISPATCH] Creating dispatches...');
    for (const shop of allShops) {
      const dispatchNo = await generateDispatchNo();
      await Dispatch.create({
        dispatchNo,
        shopId: shop._id,
        items: products.slice(0, 10).map(p => ({
          productId: p._id,
          quantity: 50 + Math.floor(Math.random() * 100),
          status: 'received'
        })),
        status: 'received',
        dispatchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        confirmedBy: staffData[allShops.indexOf(shop) * 5]?._id
      });

      // Update inventory
      products.slice(0, 10).forEach(p => {
        Inventory.findOneAndUpdate(
          { shopId: shop._id, productId: p._id },
          { $inc: { quantity: 50 + Math.floor(Math.random() * 100) } },
          { upsert: true }
        );
      });
    }
    console.log(`[✓] Dispatches + inventory updated\n`);

    // ==================== SALES DATA FOR CHARTS ====================
    console.log('[SALES] Creating sales data...');
    const branchRevenue = [125000, 98000, 145000, 87000, 112000]; // Matches mock data
    const transactions = [245, 167, 312, 154, 198];

    for (let b = 0; b < allShops.length; b++) {
      const shopId = allShops[b]._id;
      const targetRevenue = branchRevenue[b];
      const targetTrans = transactions[b];
      
      for (let s = 0; s < targetTrans; s++) {
        const billNo = await generateBillNo();
        const itemCount = 1 + Math.floor(Math.random() * 4);
        const items = [];
        let billTotal = 0;
        
        for (let i = 0; i < itemCount; i++) {
          const prod = products[Math.floor(Math.random() * products.length)];
          const qty = 1 + Math.floor(Math.random() * 5);
          const subtotal = prod.price * qty;
          items.push({
            productId: prod._id,
            productName: prod.name,
            quantity: qty,
            price: prod.price,
            subtotal
          });
          billTotal += subtotal;
        }

        // Distribute revenue evenly across transactions
        const avgBill = targetRevenue / targetTrans;
        const finalTotal = Math.round(avgBill + (Math.random() - 0.5) * avgBill * 0.3);

        const shopStaff = await Staff.find({ shopId }).select('_id').limit(5);
        const randomStaffId = shopStaff[Math.floor(Math.random() * shopStaff.length)]?._id;
        
        await Sale.create({
          billNo,
          shopId,
          staffId: randomStaffId,
          items,
          totalAmount: finalTotal,
          paymentMethod: 'cash',
          paymentStatus: 'completed',
          saleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }


    console.log('[✓] Sales data created for analytics!\n');

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════════');
    console.log('[SUCCESS] ANALYTICS DATA SEEDED!');
    console.log('SuperAdmin dashboard now has rich charts data!');
    console.log('\nRUN: cd server && node src/scripts/seedAnalyticsData.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedAnalyticsData();
