const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const testPasswordOnly = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'shoaibfm1988@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);

    // Test different passwords
    const passwordsToTest = [
      'admin123',
      'admin',
      'Admin123',
      'password',
      '123456',
      'shoaib123',
      'Shoaib123',
      'admin@123'
    ];

    console.log('\n🔍 Testing passwords...');
    
    let foundPassword = null;
    for (const password of passwordsToTest) {
      try {
        const isValid = await bcrypt.compare(password, adminUser.password);
        console.log(`   "${password}": ${isValid ? '✅ MATCH!' : '❌'}`);
        if (isValid && !foundPassword) {
          foundPassword = password;
        }
      } catch (error) {
        console.log(`   "${password}": ERROR - ${error.message}`);
      }
    }

    if (foundPassword) {
      console.log('\n🎉 SUCCESS! Found working password:');
      console.log('📧 Email: shoaibfm1988@gmail.com');
      console.log(`🔑 Password: ${foundPassword}`);
      console.log('\n🌐 You can now login at: http://localhost:3000/admin/login');
    } else {
      console.log('\n❌ No matching password found. Creating new admin account...');
      
      // Delete old admin and create new one
      await User.deleteOne({ email: 'shoaibfm1988@gmail.com' });
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        name: 'Admin User',
        email: 'shoaibfm1988@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        wallet: {
          usd: 0,
          aed: 0,
          euro: 0,
          sar: 0
        }
      });
      
      await newAdmin.save();
      
      // Verify the new password
      const isNewPasswordValid = await bcrypt.compare('admin123', newAdmin.password);
      console.log(`✅ New admin created with password verification: ${isNewPasswordValid}`);
      
      if (isNewPasswordValid) {
        console.log('\n🎉 NEW ADMIN ACCOUNT CREATED:');
        console.log('📧 Email: shoaibfm1988@gmail.com');
        console.log('🔑 Password: admin123');
        console.log('\n🌐 You can now login at: http://localhost:3000/admin/login');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
testPasswordOnly();
