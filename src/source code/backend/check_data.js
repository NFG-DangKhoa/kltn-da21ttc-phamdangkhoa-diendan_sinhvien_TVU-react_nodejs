const mongoose = require('mongoose');
const Message = require('./models/Message');

async function checkData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/student_forum_db');
        console.log('Connected to MongoDB');

        // Kiểm tra messages có senderId là number
        const numericSenderMessages = await Message.find({
            senderId: { $type: 'number' }
        });
        
        console.log('Messages with numeric senderId:', numericSenderMessages.length);
        numericSenderMessages.forEach(msg => {
            console.log('ID:', msg._id, 'SenderId:', msg.senderId, 'Type:', typeof msg.senderId);
        });

        // Kiểm tra messages có receiverId là number
        const numericReceiverMessages = await Message.find({
            receiverId: { $type: 'number' }
        });
        
        console.log('Messages with numeric receiverId:', numericReceiverMessages.length);
        numericReceiverMessages.forEach(msg => {
            console.log('ID:', msg._id, 'ReceiverId:', msg.receiverId, 'Type:', typeof msg.receiverId);
        });

        // Kiểm tra tất cả messages
        const allMessages = await Message.find({}).limit(5);
        console.log('Sample messages:');
        allMessages.forEach(msg => {
            console.log('ID:', msg._id, 'SenderId:', msg.senderId, 'ReceiverId:', msg.receiverId);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkData();
