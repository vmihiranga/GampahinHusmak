import mongoose from 'mongoose';
import { BadgeTemplate, User } from './backend/models';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL;

async function seedBadges() {
  try {
    if (!MONGODB_URI) throw new Error('DATABASE_URL not found');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const superAdmin = await User.findOne({ role: 'superadmin' });
    if (!superAdmin) {
      console.error('Super Admin not found. Run reset-db first.');
      process.exit(1);
    }

    const defaultBadges = [
      {
        name: "First Sprout",
        badgeType: "trees_planted",
        description: "Planted your very first tree! Welcome to the movement.",
        icon: "🌱",
        triggerCount: 1,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: "Green Thumb",
        badgeType: "trees_planted",
        description: "Successfully planted 5 trees. You're a natural!",
        icon: "🌿",
        triggerCount: 5,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: "Forest Guardian",
        badgeType: "trees_planted",
        description: "10 trees planted! You are truly making a difference.",
        icon: "🌳",
        triggerCount: 10,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: "Active Contributor",
        badgeType: "updates_submitted",
        description: "Submitted your first progress update. Consistency is key!",
        icon: "📈",
        triggerCount: 1,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: "Eco Reporter",
        badgeType: "updates_submitted",
        description: "5 progress updates submitted. Thank you for keeping us informed!",
        icon: "📝",
        triggerCount: 5,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: "Community Spirit",
        badgeType: "events_attended",
        description: "Joined your first community planting event.",
        icon: "🤝",
        triggerCount: 1,
        isActive: true,
        createdBy: superAdmin._id
      }
    ];

    for (const badge of defaultBadges) {
      await BadgeTemplate.findOneAndUpdate(
        { name: badge.name },
        badge,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Default badges seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding badges:', err);
    process.exit(1);
  }
}

seedBadges();
