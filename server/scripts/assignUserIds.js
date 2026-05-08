/**
 * One-off script: assign userIds to specific existing users.
 * Run: node scripts/assignUserIds.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const generateUserId = async (name) => {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const first = parts[0].replace(/[^a-z0-9]/g, '').slice(0, 8);
  const lastInitial = parts.length > 1
    ? (parts[parts.length - 1][0] || '').replace(/[^a-z]/g, '')
    : '';
  const prefix = first + lastInitial;

  const users = await User.find({ userId: { $exists: true, $ne: null } }, 'userId');
  let maxNum = 999;
  for (const u of users) {
    if (u.userId && u.userId.length >= 7) {
      const tail = parseInt(u.userId.slice(-7), 10);
      if (!isNaN(tail) && tail > maxNum) maxNum = tail;
    }
  }

  const suffix = String(maxNum + 1).padStart(7, '0');
  return `${prefix}${suffix}`;
};

const TARGETS = [
  'faisalzafar781@gmail.com',
  'shoaibfm1988@gmail.com',
  'kashafsaleem118@gmail.com',
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  for (const email of TARGETS) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`  ✗  Not found: ${email}`);
      continue;
    }
    if (user.userId) {
      console.log(`  ↷  Already has userId: ${email}  →  ${user.userId}`);
      continue;
    }
    const userId = await generateUserId(user.name);
    user.userId = userId;
    await user.save({ validateBeforeSave: false });
    console.log(`  ✓  Assigned: ${email}  →  ${userId}`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
