const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'shoaibfm1988@gmail.com' });
    
    if (existingAdmin) {
      // Update existing user to admin role
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin role assigned to existing user: shoaibfm1988@gmail.com');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
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

      await adminUser.save();
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email: shoaibfm1988@gmail.com');
      console.log('🔑 Password: admin123');
    }

    console.log('\n🎉 Admin account ready!');
    console.log('🌐 Admin Panel URL: http://localhost:3000/admin');
    console.log('📋 Admin Features:');
    console.log('   - Manage leads and their status');
    console.log('   - Review and approve withdrawals');
    console.log('   - Manage user accounts');
    console.log('   - Set user earnings for all currencies');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createAdmin();
