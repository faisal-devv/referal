const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createWorkingAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Delete any existing admin
    await User.deleteOne({ email: 'shoaibfm1988@gmail.com' });
    console.log('🗑️ Deleted existing admin account');

    // Manually hash the password
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('🔧 Manually hashing password...');
    console.log(`   Plain: ${plainPassword}`);
    console.log(`   Hashed: ${hashedPassword}`);

    // Create admin with pre-hashed password (bypass pre-save hook)
    const adminData = {
      name: 'Admin User',
      email: 'shoaibfm1988@gmail.com',
      password: hashedPassword, // Pre-hashed to bypass the hook
      role: 'admin',
      isActive: true,
      wallet: {
        usd: 0,
        aed: 0,
        euro: 0,
        sar: 0
      }
    };

    // Use insertOne to bypass mongoose pre-save hooks
    const result = await User.collection.insertOne(adminData);
    console.log('✅ Admin account created with insertOne');

    // Verify the account
    const verifyAdmin = await User.findOne({ email: 'shoaibfm1988@gmail.com' });
    console.log('\n🔍 Verification:');
    console.log(`   Email: ${verifyAdmin.email}`);
    console.log(`   Role: ${verifyAdmin.role}`);
    console.log(`   Active: ${verifyAdmin.isActive}`);
    
    // Test password comparison
    const isPasswordValid = await bcrypt.compare(plainPassword, verifyAdmin.password);
    console.log(`   Password verification: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('\n🎉 SUCCESS! Admin credentials are working:');
      console.log('📧 Email: shoaibfm1988@gmail.com');
      console.log('🔑 Password: admin123');
      console.log('\n🌐 You can now login at: http://localhost:3000/admin/login');
    } else {
      console.log('\n❌ Password verification still failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createWorkingAdmin();
