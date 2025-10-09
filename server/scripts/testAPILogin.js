const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const testAPILogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Test the login API
    const loginData = JSON.stringify({
      email: 'shoaibfm1988@gmail.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    console.log('🌐 Testing API login...');
    console.log('   URL: http://localhost:5000/api/auth/login');
    console.log('   Email: shoaibfm1988@gmail.com');
    console.log('   Password: admin123');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n📡 API Response:`);
        console.log(`   Status: ${res.statusCode}`);
        
        try {
          const responseData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ API Login SUCCESSFUL!');
            console.log(`   User ID: ${responseData._id}`);
            console.log(`   Name: ${responseData.name}`);
            console.log(`   Email: ${responseData.email}`);
            console.log(`   Role: ${responseData.role}`);
            console.log(`   Token: ${responseData.token ? 'Received' : 'Not received'}`);
            
            console.log('\n🎉 ADMIN LOGIN IS WORKING!');
            console.log('📧 Email: shoaibfm1988@gmail.com');
            console.log('🔑 Password: admin123');
            console.log('\n🌐 You can now login at: http://localhost:3000/admin/login');
            
          } else {
            console.log('❌ API Login FAILED:');
            console.log(`   Message: ${responseData.message || 'Unknown error'}`);
          }
        } catch (parseError) {
          console.log('❌ Error parsing response:', parseError.message);
          console.log('   Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
    });

    req.write(loginData);
    req.end();

    // Wait a moment for the request to complete
    setTimeout(() => {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
};

// Run the script
testAPILogin();
