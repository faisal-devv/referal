const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const fixEmployeePassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub');
    console.log('Connected to MongoDB');

    // Find the employee user
    const employeeUser = await User.findOne({ email: 'employee@referralhub.com' });
    
    if (!employeeUser) {
      console.log('❌ Employee user not found');
      return;
    }

    console.log('✅ Employee user found:');
    console.log(`   Email: ${employeeUser.email}`);
    console.log(`   Name: ${employeeUser.name}`);
    console.log(`   Role: ${employeeUser.role}`);

    // Generate a new password hash
    const plainPassword = 'employee123';
    const saltRounds = 12;
    const newHashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('\n🔧 Updating password...');
    
    // Update the password using insertOne to bypass mongoose pre-save hooks
    await User.collection.updateOne(
      { email: 'employee@referralhub.com' },
      { $set: { password: newHashedPassword, role: 'employee' } }
    );
    
    console.log('✅ Password updated successfully!');
    
    // Test the new password
    const updatedUser = await User.findOne({ email: 'employee@referralhub.com' });
    const isPasswordValid = await bcrypt.compare(plainPassword, updatedUser.password);
    console.log(`🔍 Password verification: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('\n🎉 SUCCESS! Employee credentials are working:');
      console.log('📧 Email: employee@referralhub.com');
      console.log('🔑 Password: employee123');
      console.log('\n🌐 You can now login at: http://localhost:3000/admin/login');
      console.log('🌐 Employee Panel: http://localhost:3000/employee');
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
fixEmployeePassword();
