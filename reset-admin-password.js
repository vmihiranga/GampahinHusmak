import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  family: 4,
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function resetAdminPassword() {
  try {
    await client.connect();
    const db = client.db('gampahin');
    
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await db.collection('users').updateOne(
      { email: 'admin@gampahinhusmak.lk' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Password reset successful!');
      console.log('---');
      console.log('Email: admin@gampahinhusmak.lk');
      console.log('New Password: ' + newPassword);
    } else {
      console.log('User not found or password unchanged');
    }
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
