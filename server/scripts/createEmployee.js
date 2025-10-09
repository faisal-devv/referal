const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createEmployee = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Check if employee already exists
    const existingEmployee = await User.findOne({ email: 'employee@referralhub.com' });
    
    if (existingEmployee) {
      console.log('✅ Employee account already exists:');
      console.log(`   Email: ${existingEmployee.email}`);
      console.log(`   Name: ${existingEmployee.name}`);
      console.log(`   Role: ${existingEmployee.role}`);
      
      // Update to employee role if not already
      if (existingEmployee.role !== 'employee') {
        existingEmployee.role = 'employee';
        await existingEmployee.save();
        console.log('✅ Role updated to employee');
      }
    } else {
      // Create new employee user
      const hashedPassword = await bcrypt.hash('employee123', 10);
      
      const employeeUser = new User({
        name: 'Employee User',
        email: 'employee@referralhub.com',
        password: hashedPassword,
        role: 'employee',
        isActive: true,
        wallet: {
          usd: 0,
          aed: 0,
          euro: 0,
          sar: 0
        }
      });

      await employeeUser.save();
      console.log('✅ Employee account created successfully!');
      console.log('📧 Email: employee@referralhub.com');
      console.log('🔑 Password: employee123');
    }

    // Verify the employee account
    const verifyEmployee = await User.findOne({ email: 'employee@referralhub.com' });
    console.log('\n🔍 Verification:');
    console.log(`   Email: ${verifyEmployee.email}`);
    console.log(`   Role: ${verifyEmployee.role}`);
    console.log(`   Active: ${verifyEmployee.isActive}`);
    
    // Test password
    const isPasswordValid = await bcrypt.compare('employee123', verifyEmployee.password);
    console.log(`   Password Valid: ${isPasswordValid}`);
    
    console.log('\n🎉 Employee account is ready!');
    console.log('🌐 Employee Panel URL: http://localhost:3000/employee');
    console.log('🌐 Login URL: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error creating employee account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createEmployee();
