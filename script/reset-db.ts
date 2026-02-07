import mongoose from 'mongoose';
import { User, Tree, TreeUpdate, Event, Contact, BadgeTemplate, Achievement } from '../backend/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables!');
  process.exit(1);
}

async function resetDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    console.log('Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      Tree.deleteMany({}),
      TreeUpdate.deleteMany({}),
      Event.deleteMany({}),
      Contact.deleteMany({}),
      BadgeTemplate.deleteMany({}),
      Achievement.deleteMany({})
    ]);
    console.log('✅ All collections cleared!');

    // Seed New Super Admin
    const username = 'vishwamihi';
    const email = 'vishwamihi@gmail.com';
    const password = 'Vishwa@1214%';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
      fullName: 'Vishwa Mihi',
      role: 'superadmin',
      isVerified: true,
      phoneNumber: '+94700000000'
    });

    console.log(`\n🚀 Database Reset Complete!`);
    console.log(`------------------------------`);
    console.log(`New Super Admin Created:`);
    console.log(`Username: ${username}`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     superadmin`);
    console.log(`------------------------------\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDB();
