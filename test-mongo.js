import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DATABASE_URL;

console.log('Testing MongoDB connection...');
console.log('Node version:', process.version);
console.log('Connection string (masked):', uri?.replace(/:[^:@]+@/, ':****@'));

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function test() {
  try {
    console.log('\nAttempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db('gampahin');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

test();
