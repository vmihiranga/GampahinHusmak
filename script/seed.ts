import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Tree, Event, Gallery } from '../server/models';
import connectDB from '../server/db';

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Tree.deleteMany({});
    await Event.deleteMany({});
    await Gallery.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@gampahinhusmak.lk',
      password: adminPassword,
      fullName: 'System Administrator',
      role: 'admin',
      phoneNumber: '+94771234567',
      isVerified: true,
    });

    console.log('👤 Created admin user');

    // Create sample users
    const userPassword = await bcrypt.hash('user123', 10);
    const users = await User.create([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: userPassword,
        fullName: 'John Doe',
        role: 'volunteer',
        phoneNumber: '+94771234568',
        isVerified: true,
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: userPassword,
        fullName: 'Jane Smith',
        role: 'user',
        phoneNumber: '+94771234569',
        isVerified: true,
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        password: userPassword,
        fullName: 'Mike Wilson',
        role: 'volunteer',
        phoneNumber: '+94771234570',
        isVerified: true,
      },
    ]);

    console.log('👥 Created sample users');

    // Create sample trees
    const trees = await Tree.create([
      {
        treeId: 'TREE-2026-001',
        plantedBy: users[0]._id,
        species: 'Mangifera indica',
        commonName: 'Mango Tree',
        location: {
          type: 'Point',
          coordinates: [80.0167, 7.0833],
          address: 'Gampaha Town Park',
          district: 'Gampaha',
        },
        plantedDate: new Date('2024-02-04'),
        currentHeight: 45,
        currentHealth: 'excellent',
        images: ['https://images.unsplash.com/photo-1590502593747-42a996133562?w=800'],
        notes: 'Planted during Independence Day celebration',
        status: 'active',
      },
      {
        treeId: 'TREE-2026-002',
        plantedBy: users[1]._id,
        species: 'Artocarpus heterophyllus',
        commonName: 'Jackfruit Tree',
        location: {
          type: 'Point',
          coordinates: [80.0200, 7.0900],
          address: 'Yakkala Community Center',
          district: 'Gampaha',
        },
        plantedDate: new Date('2024-03-15'),
        currentHeight: 38,
        currentHealth: 'good',
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'],
        notes: 'Community planting event',
        status: 'active',
      },
      {
        treeId: 'TREE-2026-003',
        plantedBy: users[2]._id,
        species: 'Azadirachta indica',
        commonName: 'Neem Tree',
        location: {
          type: 'Point',
          coordinates: [80.0100, 7.0700],
          address: 'Kadawatha School Grounds',
          district: 'Gampaha',
        },
        plantedDate: new Date('2024-04-22'),
        currentHeight: 52,
        currentHealth: 'excellent',
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'],
        notes: 'Earth Day special planting',
        status: 'active',
      },
      {
        treeId: 'TREE-2026-004',
        plantedBy: admin._id,
        species: 'Cocos nucifera',
        commonName: 'Coconut Palm',
        location: {
          type: 'Point',
          coordinates: [80.0250, 7.0950],
          address: 'Negombo Road Junction',
          district: 'Gampaha',
        },
        plantedDate: new Date('2024-05-10'),
        currentHeight: 65,
        currentHealth: 'good',
        images: ['https://images.unsplash.com/photo-1566990734309-408f5c3d0b5e?w=800'],
        notes: 'Roadside beautification project',
        status: 'active',
      },
      {
        treeId: 'TREE-2026-005',
        plantedBy: users[0]._id,
        species: 'Tamarindus indica',
        commonName: 'Tamarind Tree',
        location: {
          type: 'Point',
          coordinates: [80.0050, 7.0650],
          address: 'Wewala Temple Premises',
          district: 'Gampaha',
        },
        plantedDate: new Date('2024-06-18'),
        currentHeight: 42,
        currentHealth: 'good',
        images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'],
        notes: 'Temple conservation initiative',
        status: 'active',
      },
    ]);

    console.log('🌳 Created sample trees');

    // Create sample events
    const events = await Event.create([
      {
        title: 'Independence Day Tree Planting',
        description: 'Join us for a massive tree planting event to celebrate Sri Lanka\'s Independence Day. We aim to plant 500 trees across Gampaha district.',
        eventDate: new Date('2026-02-04'),
        location: {
          address: 'Gampaha District Secretariat Grounds',
          coordinates: [80.0167, 7.0833],
        },
        organizer: admin._id,
        participants: [users[0]._id, users[1]._id, users[2]._id],
        maxParticipants: 100,
        targetTrees: 500,
        actualTrees: 487,
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'],
        status: 'completed',
      },
      {
        title: 'School Green Initiative',
        description: 'Partner with local schools to plant trees in school compounds and teach students about environmental conservation.',
        eventDate: new Date('2026-03-15'),
        location: {
          address: 'Various Schools in Gampaha',
          coordinates: [80.0200, 7.0900],
        },
        organizer: users[2]._id,
        participants: [admin._id, users[0]._id, users[1]._id],
        maxParticipants: 50,
        targetTrees: 200,
        actualTrees: 215,
        images: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'],
        status: 'completed',
      },
      {
        title: 'World Environment Day Celebration',
        description: 'Celebrate World Environment Day by planting native trees and cleaning up public spaces.',
        eventDate: new Date('2026-06-05'),
        location: {
          address: 'Biyagama Export Processing Zone',
          coordinates: [80.0300, 7.1000],
        },
        organizer: admin._id,
        participants: [users[0]._id, users[1]._id],
        maxParticipants: 75,
        targetTrees: 300,
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'],
        status: 'upcoming',
      },
    ]);

    console.log('📅 Created sample events');

    // Create sample gallery items
    await Gallery.create([
      {
        title: 'Independence Day Success',
        description: 'Amazing turnout at our Independence Day tree planting event!',
        images: [
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        ],
        uploadedBy: admin._id,
        relatedEvent: events[0]._id,
        tags: ['event', 'independence-day', 'community'],
      },
      {
        title: 'Young Saplings Growing Strong',
        description: 'Our mango trees are thriving after 3 months!',
        images: ['https://images.unsplash.com/photo-1590502593747-42a996133562?w=800'],
        uploadedBy: users[0]._id,
        relatedTree: trees[0]._id,
        tags: ['growth', 'mango', 'progress'],
      },
      {
        title: 'Community Coming Together',
        description: 'Volunteers working hard to make Gampaha greener.',
        images: [
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
        ],
        uploadedBy: users[1]._id,
        tags: ['community', 'volunteers', 'teamwork'],
      },
    ]);

    console.log('🖼️  Created sample gallery items');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@gampahinhusmak.lk / admin123');
    console.log('   User: john@example.com / user123');
    console.log('   User: jane@example.com / user123');
    console.log('   User: mike@example.com / user123\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
