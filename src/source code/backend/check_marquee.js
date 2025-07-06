require('dotenv').config();
const mongoose = require('mongoose');
const Marquee = require('./models/Marquee');

const checkMarqueeStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const activeMarquee = await Marquee.findOne({ active: true });

    if (activeMarquee) {
      console.log('Found active marquee:', activeMarquee);
    } else {
      console.log('No active marquee found.');
    }
  } catch (error) {
    console.error('Error checking marquee status:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkMarqueeStatus();
