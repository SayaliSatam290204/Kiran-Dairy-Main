import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kiran-dairy.com',
      phone: null, // Admin doesn't use phone
      password: hashedPassword,
      role: 'admin'
    });

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Full Cream Milk',
        sku: 'MILK-FULL-001',
        description: 'Rich and creamy full cream milk.',
        price: 64,
        unit: 'liter',
        category: 'Liquid Milk',
        subcategory: 'Full Cream Milk',
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
        image: '/uploads/products/full-cream-milk.jpg',
        isActive: true
      },
      {
        name: 'Toned Milk',
        sku: 'MILK-TONED-001',
        description: 'Balanced fat toned milk.',
        price: 56,
        unit: 'liter',
        category: 'Liquid Milk',
        subcategory: 'Toned Milk',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        image: '/uploads/products/toned-milk.jpg',
        isActive: true
      },
      {
        name: 'Double Toned Milk',
        sku: 'MILK-DBT-001',
        description: 'Low fat double toned milk.',
        price: 52,
        unit: 'liter',
        category: 'Liquid Milk',
        subcategory: 'Double Toned Milk',
        imageUrl: 'https://images.unsplash.com/photo-1576186726112-3f3b5f4b6d3d',
        image: '/uploads/products/double-toned-milk.jpg',
        isActive: true
      },
      {
        name: 'Cow Milk',
        sku: 'MILK-COW-001',
        description: 'Fresh cow milk.',
        price: 66,
        unit: 'liter',
        category: 'Liquid Milk',
        subcategory: 'Cow Milk',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-431d7b87a0b7',
        image: '/uploads/products/cow-milk.jpg',
        isActive: true
      },
      {
        name: 'Curd (Dahi)',
        sku: 'CURD-001',
        description: 'Fresh homemade style curd.',
        price: 70,
        unit: 'kg',
        category: 'Fermented Products',
        subcategory: 'Curd',
        imageUrl: 'https://images.unsplash.com/photo-1604908177522-432c7c2a1d2d',
        image: '/uploads/products/curd.jpg',
        isActive: true
      },
      {
        name: 'Greek Yogurt',
        sku: 'YOGURT-GREEK-001',
        description: 'High protein thick yogurt.',
        price: 110,
        unit: 'kg',
        category: 'Fermented Products',
        subcategory: 'Greek Yogurt',
        imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707',
        image: '/uploads/products/greek-yogurt.jpg',
        isActive: true
      },
      {
        name: 'Sweet Lassi',
        sku: 'LASSI-001',
        description: 'Refreshing sweet lassi.',
        price: 35,
        unit: 'piece',
        category: 'Fermented Products',
        subcategory: 'Lassi',
        imageUrl: 'https://images.unsplash.com/photo-1625944232410-1c8e5e0f6b0d',
        image: '/uploads/products/lassi.jpg',
        isActive: true
      },
      {
        name: 'Salted Butter',
        sku: 'BUTTER-SALT-001',
        description: 'Fresh salted butter.',
        price: 55,
        unit: 'piece',
        category: 'Fat-rich Products',
        subcategory: 'Butter',
        imageUrl: 'https://images.unsplash.com/photo-1589985270958-b6e3b6c8e7d6',
        image: '/uploads/products/salted-butter.jpg',
        isActive: true
      },
      {
        name: 'White Butter',
        sku: 'BUTTER-WHITE-001',
        description: 'Traditional white butter.',
        price: 60,
        unit: 'piece',
        category: 'Fat-rich Products',
        subcategory: 'Butter',
        imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2',
        image: '/uploads/products/white-butter.jpg',
        isActive: true
      },
      {
        name: 'Cow Ghee',
        sku: 'GHEE-COW-001',
        description: 'Pure cow ghee.',
        price: 650,
        unit: 'kg',
        category: 'Fat-rich Products',
        subcategory: 'Ghee',
        imageUrl: 'https://images.unsplash.com/photo-1633945274405-1f1c8d7e2b5c',
        image: '/uploads/products/cow-ghee.jpg',
        isActive: true
      },
      {
        name: 'Fresh Paneer',
        sku: 'PANEER-001',
        description: 'Soft and fresh paneer.',
        price: 320,
        unit: 'kg',
        category: 'Cheese & Paneer',
        subcategory: 'Paneer',
        imageUrl: 'https://images.unsplash.com/photo-1631515243346-54a1e2a4c0c4',
        image: '/uploads/products/fresh-paneer.jpg',
        isActive: true
      },
      {
        name: 'Malai Paneer',
        sku: 'PANEER-MALAI-001',
        description: 'Creamy malai paneer.',
        price: 350,
        unit: 'kg',
        category: 'Cheese & Paneer',
        subcategory: 'Paneer',
        imageUrl: 'https://images.unsplash.com/photo-1631515243415-1a6f9a7e5f0f',
        image: '/uploads/products/malai-paneer.jpg',
        isActive: true
      },
      {
        name: 'Mozzarella Cheese',
        sku: 'CHEESE-MOZ-001',
        description: 'Pizza grade mozzarella cheese.',
        price: 420,
        unit: 'kg',
        category: 'Cheese & Paneer',
        subcategory: 'Mozzarella',
        imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a708',
        image: '/uploads/products/mozzarella-cheese.jpg',
        isActive: true
      },
      {
        name: 'Khoya',
        sku: 'KHOYA-001',
        description: 'Premium quality khoya.',
        price: 480,
        unit: 'kg',
        category: 'Sweet Products',
        subcategory: 'Khoya',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
        image: '/uploads/products/khoya.jpg',
        isActive: true
      },
      {
        name: 'Rasmalai',
        sku: 'RASMALAI-001',
        description: 'Delicious rasmalai sweet.',
        price: 30,
        unit: 'piece',
        category: 'Sweet Products',
        subcategory: 'Rasmalai',
        imageUrl: 'https://images.unsplash.com/photo-1631515243605-4b6f6f3f7f6d',
        image: '/uploads/products/rasmalai.jpg',
        isActive: true
      },
      {
        name: 'Milk Cake',
        sku: 'MILKCAKE-001',
        description: 'Traditional milk cake sweet.',
        price: 420,
        unit: 'kg',
        category: 'Sweet Products',
        subcategory: 'Milk Cake',
        imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1d5d2957',
        image: '/uploads/products/milk-cake.jpg',
        isActive: true
      },
      {
        name: 'Vanilla Ice Cream',
        sku: 'ICECREAM-VAN-001',
        description: 'Classic vanilla ice cream.',
        price: 120,
        unit: 'piece',
        category: 'Frozen Dairy',
        subcategory: 'Ice Cream',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
        image: '/uploads/products/vanilla-icecream.jpg',
        isActive: true
      },
      {
        name: 'Chocolate Ice Cream',
        sku: 'ICECREAM-CHO-001',
        description: 'Rich chocolate ice cream.',
        price: 130,
        unit: 'piece',
        category: 'Frozen Dairy',
        subcategory: 'Ice Cream',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
        image: '/uploads/products/chocolate-icecream.jpg',
        isActive: true
      },
      {
        name: 'Milk Powder',
        sku: 'POWDER-MILK-001',
        description: 'Premium milk powder.',
        price: 450,
        unit: 'kg',
        category: 'Powdered Dairy',
        subcategory: 'Milk Powder',
        imageUrl: 'https://images.unsplash.com/photo-1604908177073-3c3d2d7a4b3f',
        image: '/uploads/products/milk-powder.jpg',
        isActive: true
      },
      {
        name: 'Dairy Whitener',
        sku: 'WHITENER-001',
        description: 'Tea and coffee dairy whitener.',
        price: 320,
        unit: 'kg',
        category: 'Powdered Dairy',
        subcategory: 'Dairy Whitener',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        image: '/uploads/products/dairy-whitener.jpg',
        isActive: true
      },
      {
        name: 'Chocolate Milk',
        sku: 'MILK-CHOC-001',
        description: 'Chocolate flavored milk.',
        price: 30,
        unit: 'piece',
        category: 'Value-added / Flavored',
        subcategory: 'Chocolate Milk',
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767',
        image: '/uploads/products/chocolate-milk.jpg',
        isActive: true
      },
      {
        name: 'Badam Milk',
        sku: 'MILK-BADAM-001',
        description: 'Almond flavored milk drink.',
        price: 35,
        unit: 'piece',
        category: 'Value-added / Flavored',
        subcategory: 'Badam Milk',
        imageUrl: 'https://images.unsplash.com/photo-1625944232410-1c8e5e0f6b0d',
        image: '/uploads/products/badam-milk.jpg',
        isActive: true
      },
      {
        name: 'Strawberry Milk',
        sku: 'MILK-STR-001',
        description: 'Strawberry flavored milk.',
        price: 32,
        unit: 'piece',
        category: 'Value-added / Flavored',
        subcategory: 'Strawberry Milk',
        imageUrl: 'https://images.unsplash.com/photo-1604908177043-64b2d5e6f0f4',
        image: '/uploads/products/strawberry-milk.jpg',
        isActive: true
      }
    ]);

    console.log('✅ Seed data created successfully');
    console.log(`\n📝 ADMIN LOGIN:`);
    console.log(`   Email: admin@kiran-dairy.com`);
    console.log(`   Password: admin123`);
    console.log(`\n📦 Products created: ${products.length} items`);
    console.log(`\n💡 IMPORTANT: Create shop users via Admin UI "Add Shop" form`);
    console.log(`   Shop username will be the shop name`);
    console.log(`   Admin will set password for shop managers`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
