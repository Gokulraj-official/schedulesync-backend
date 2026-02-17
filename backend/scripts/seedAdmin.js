const dotenv = require('dotenv');
const connectDB = require('../config/database');
const User = require('../models/User');

dotenv.config();

const getArg = (key) => {
  const idx = process.argv.indexOf(`--${key}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
};

const run = async () => {
  const email = getArg('email');
  const password = getArg('password');
  const name = getArg('name') || 'Admin';

  if (!email || !password) {
    console.error('Missing required args: --email and --password');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!existing) {
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      department: 'Admin',
      isVerified: true,
    });

    console.log(`Admin created: ${user.email} (${user._id})`);
    process.exit(0);
  }

  existing.name = name;
  existing.password = password;
  existing.role = 'admin';
  existing.department = existing.department || 'Admin';
  existing.isVerified = true;

  await existing.save();

  console.log(`Admin updated: ${existing.email} (${existing._id})`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
