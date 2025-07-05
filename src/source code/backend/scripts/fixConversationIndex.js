const mongoose = require('mongoose');
require('dotenv').config();

async function fixConversationIndex() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dien_dan_TVU');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const conversationsCollection = db.collection('conversations');

        // Liệt kê tất cả indexes
        const indexes = await conversationsCollection.indexes();
        console.log('📋 Current indexes:', indexes.map(idx => idx.name));

        // Xóa index cũ nếu tồn tại
        try {
            await conversationsCollection.dropIndex('participants_1_type_1');
            console.log('✅ Dropped old index: participants_1_type_1');
        } catch (error) {
            console.log('ℹ️ Index participants_1_type_1 not found (already dropped)');
        }

        // Xóa tất cả conversations để tránh conflict
        const deleteResult = await conversationsCollection.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} existing conversations`);

        console.log('🎉 Index fix completed successfully!');
        console.log('ℹ️ New index will be created automatically by Mongoose when server starts');

    } catch (error) {
        console.error('❌ Error fixing index:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Chạy script
fixConversationIndex();
