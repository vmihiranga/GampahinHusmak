import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  family: 4,
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function getAdmins() {
  try {
    await client.connect();
    const db = client.db('gampahin');
    
    // Get admin and superadmin users
    const admins = await db.collection('users').find({
      role: { $in: ['admin', 'superadmin'] }
    }).toArray();
    
    let output = '=== Admin Accounts ===\n\n';
    admins.forEach(u => {
      output += `Username: ${u.username}\n`;
      output += `Email: ${u.email}\n`;
      output += `Role: ${u.role}\n`;
      output += `Full Name: ${u.fullName}\n`;
      output += '---\n';
    });
    
    if (admins.length === 0) {
      output += 'No admin accounts found!\n';
    }
    
    fs.writeFileSync('admin-accounts.txt', output);
    console.log('Admin info written to admin-accounts.txt');
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getAdmins();
