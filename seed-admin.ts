import mongoose from 'mongoose';
import { User } from './backend/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables!');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const username = 'admin';
    const email = 'admin@gampahin.lk';
    const password = 'admin123';
    
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        email,
        password: hashedPassword,
        fullName: 'Project Gampahin Admin',
        role: 'admin',
        isVerified: true,
        phoneNumber: '+94770000000'
      });
      console.log(`✅ Admin account created!`);
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
    } else {
      console.log(`ℹ️ Admin account already exists (username: ${existing.username}, role: ${existing.role})`);
      if (existing.role !== 'admin') {
         existing.role = 'admin';
         await existing.save();
         console.log(`✅ Updated existing user to admin role.`);
      }
      console.log(`Username: ${existing.username}`);
      console.log(`Password: admin123 (assuming it was set to this or you know it)`);
      console.log('If you forgot the password, you can delete the user from DB and re-run this script.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
