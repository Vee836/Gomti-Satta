require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/admin_dashboard');
    
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: 'password123',
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${adminUser.email}`);
    console.log('Password: password123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
