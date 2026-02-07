import mongoose from 'mongoose';
import { BadgeTemplate, User } from './backend/models';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables!');
  process.exit(1);
}

const defaultTemplates = [
  {
    name: "First Seed",
    badgeType: "trees_planted",
    description: "Planted your very first tree!",
    icon: "🌱",
    triggerCount: 1,
    isActive: true
  },
  {
    name: "Growing Green",
    badgeType: "trees_planted",
    description: "Successfully planted 5 trees.",
    icon: "🌿",
    triggerCount: 5,
    isActive: true
  },
  {
    name: "Forest Guardian",
    badgeType: "trees_planted",
    description: "A true protector of nature with 10 trees planted.",
    icon: "🌳",
    triggerCount: 10,
    isActive: true
  },
  {
    name: "Tracker",
    badgeType: "updates_submitted",
    description: "Submitted 5 growth updates for your trees.",
    icon: "📸",
    triggerCount: 5,
    isActive: true
  },
  {
    name: "Watchman",
    badgeType: "updates_submitted",
    description: "Diligent monitoring with 15 updates submitted.",
    icon: "🔍",
    triggerCount: 15,
    isActive: true
  },
  {
    name: "Earth Hero",
    badgeType: "trees_planted",
    description: "Incredible contribution of 25 trees planted.",
    icon: "🌎",
    triggerCount: 25,
    isActive: true
  },
  {
    name: "Elite Planter",
    badgeType: "trees_planted",
    description: "Master of reforestation with 50 trees planted.",
    icon: "👑",
    triggerCount: 50,
    isActive: true
  }
];

async function seedBadges() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a superadmin user to be the creator
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) {
      console.error('No superadmin found. Please ensure at least one superadmin exists.');
      process.exit(1);
    }

    for (const template of defaultTemplates) {
      const existing = await BadgeTemplate.findOne({ name: template.name });
      if (!existing) {
        await BadgeTemplate.create({
          ...template,
          createdBy: admin._id
        });
        console.log(`Created badge: ${template.name}`);
      } else {
        console.log(`Badge already exists: ${template.name}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding badges:', error);
    process.exit(1);
  }
}

seedBadges();
