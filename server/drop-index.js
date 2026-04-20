import mongoose from 'mongoose';

async function dropIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kiran-dairy');
    console.log('Connected to MongoDB');
    
    const usersCollection = mongoose.connection.collection('users');

    // Drop all indexes on the users collection
    try {
      await usersCollection.dropIndexes();
      console.log('✅ All indexes dropped from users collection');
    } catch (e) {
      console.log('Note:', e.message);
    }

    console.log('✅ Index handling complete');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

dropIndex();
