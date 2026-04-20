import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "shop", "staff"], default: "shop" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // Clear collections manually if models are not defined, or just drop them
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            await mongoose.connection.db.collection(col.name).deleteMany({});
            console.log(`Cleared ${col.name}`);
        }

        // Add admin
        const hashedPassword = await bcryptjs.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@kiran-dairy.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin created.');

        // Add basic categories and units
        await mongoose.connection.db.collection('units').insertMany([
            { name: 'liter', shortName: 'L' },
            { name: 'kg', shortName: 'KG' },
            { name: 'piece', shortName: 'PC' },
            { name: 'dozen', shortName: 'DZ' }
        ]);
        await mongoose.connection.db.collection('categories').insertMany([
            { name: 'Liquid Milk' },
            { name: 'Fermented Products' },
            { name: 'Fat-rich Products' }
        ]);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
