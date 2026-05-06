require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI ||
  'mongodb+srv://abdullahriaz:hduh289h%40@yeahboimeow.5qio96x.mongodb.net/?retryWrites=true&w=majority&appName=yeahboimeow';

const TARGET_EMAIL = 'faisalzafar781@gmail.com';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email: TARGET_EMAIL },
      { role: 'superadmin' },
      { new: true }
    );
    if (!user) {
      console.error(`No user found with email: ${TARGET_EMAIL}`);
      process.exit(1);
    }
    console.log(`✓ ${user.email} is now "${user.role}"`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
