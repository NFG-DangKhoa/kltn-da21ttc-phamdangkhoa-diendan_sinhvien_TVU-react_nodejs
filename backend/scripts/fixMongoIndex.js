const mongoose = require('mongoose');
require('dotenv').config();

async function fixMongoIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dien_dan_TVU');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const conversationsCollection = db.collection('conversations');

        // List all indexes
        const indexes = await conversationsCollection.indexes();
        console.log('📋 Current indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Drop problematic index
        try {
            await conversationsCollection.dropIndex('participants_1_type_1');
            console.log('✅ Dropped index: participants_1_type_1');
        } catch (error) {
            console.log('ℹ️ Index participants_1_type_1 not found or already dropped');
        }

        // Clear all conversations to start fresh
        const deleteResult = await conversationsCollection.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} conversations`);

        // Clear all messages
        const messagesCollection = db.collection('messages');
        const deleteMessagesResult = await messagesCollection.deleteMany({});
        console.log(`✅ Deleted ${deleteMessagesResult.deletedCount} messages`);

        console.log('🎉 MongoDB cleanup completed!');
        console.log('ℹ️ You can now create real conversations without conflicts');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

fixMongoIndex();
