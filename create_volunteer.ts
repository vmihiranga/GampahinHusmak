import 'dotenv/config';
import connectDB from './backend/db';
import { User } from './backend/models';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

async function createVolunteer() {
  try {
    await connectDB();
    
    const username = 'gampaha_volunteer';
    const email = 'volunteer@gampahinhusmak.lk';
    const password = 'Volunteer@2026';
    const fullName = 'Gampaha New Volunteer';

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ Volunteer account already exists!');
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'volunteer',
      isVerified: true, // Auto-verify for easy testing
    });

    console.log('✅ New volunteer account created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    await mongoose.connection.close();
  } catch (error: any) {
    console.error('❌ Error creating volunteer:', error.message);
  }
}

createVolunteer();
