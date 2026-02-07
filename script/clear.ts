import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Tree, TreeUpdate, Event, Gallery, Contact, Achievement } from '../backend/models';
import connectDB from '../backend/db';

async function clear() {
  try {
    await connectDB();
    console.log('🧹 Starting database cleanup...');

    // Delete everything except Admin/SuperAdmin users
    const deleteTrees = await Tree.deleteMany({});
    const deleteUpdates = await TreeUpdate.deleteMany({});
    const deleteEvents = await Event.deleteMany({});
    const deleteGallery = await Gallery.deleteMany({});
    const deleteContacts = await Contact.deleteMany({});
    const deleteAchievements = await Achievement.deleteMany({});
    
    // Delete non-admin users
    const deleteUsers = await User.deleteMany({ role: { $nin: ['admin', 'superadmin'] } });

    console.log(`🗑️  Removed ${deleteTrees.deletedCount} trees`);
    console.log(`🗑️  Removed ${deleteUpdates.deletedCount} growth updates`);
    console.log(`🗑️  Removed ${deleteEvents.deletedCount} events`);
    console.log(`🗑️  Removed ${deleteGallery.deletedCount} gallery items`);
    console.log(`🗑️  Removed ${deleteContacts.deletedCount} contacts/messages`);
    console.log(`🗑️  Removed ${deleteAchievements.deletedCount} achievements`);
    console.log(`🗑️  Removed ${deleteUsers.deletedCount} volunteer/regular users`);

    console.log('\n✅ Database is now clean and ready for real data!');
    console.log('💡 Note: Admin and SuperAdmin users have been preserved.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

clear();
