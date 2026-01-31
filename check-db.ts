import mongoose from 'mongoose';
import { Tree, TreeUpdate, Gallery } from './server/models.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkTrees() {
  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/gampahin';
    await mongoose.connect(mongoUri);
    
    const trees = await Tree.find({});
    const galleryItems = await Gallery.find({});
    const treeUpdates = await TreeUpdate.find({});

    const report = {
        totalTrees: trees.length,
        trees: trees.map(t => ({
            id: t._id,
            name: t.commonName,
            imagesCount: t.images?.length || 0,
            hasImages: t.images && t.images.length > 0
        })),
        totalGalleryItems: galleryItems.length,
        galleryItems: galleryItems.map(g => ({
            title: g.title,
            relatedTree: g.relatedTree
        })),
        totalUpdates: treeUpdates.length
    };

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkTrees();
