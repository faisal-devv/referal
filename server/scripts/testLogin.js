const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const testLogin = async () => {
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
    console.log(`   Password hash: ${adminUser.password.substring(0, 20)}...`);

    // Test password comparison
    const testPassword = 'admin123';
    console.log(`\n🔍 Testing password: "${testPassword}"`);
    
    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`   bcrypt.compare result: ${isValid}`);

    // Test API login
    console.log('\n🌐 Testing API login...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'shoaibfm1988@gmail.com',
        password: 'admin123'
      });
      
      console.log('✅ API Login successful!');
      console.log(`   Token: ${response.data.token ? 'Received' : 'Not received'}`);
      console.log(`   User role: ${response.data.role || 'Not specified'}`);
      
    } catch (apiError) {
      console.log('❌ API Login failed:');
      console.log(`   Status: ${apiError.response?.status}`);
      console.log(`   Message: ${apiError.response?.data?.message || apiError.message}`);
    }

    // Try alternative passwords
    const alternativePasswords = ['admin', 'Admin123', 'password', '123456'];
    console.log('\n🔍 Testing alternative passwords...');
    
    for (const altPassword of alternativePasswords) {
      const isValid = await bcrypt.compare(altPassword, adminUser.password);
      if (isValid) {
        console.log(`✅ Found working password: "${altPassword}"`);
        console.log('\n🎉 Use these credentials:');
        console.log('📧 Email: shoaibfm1988@gmail.com');
        console.log(`🔑 Password: ${altPassword}`);
        break;
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
testLogin();
