const mongoose = require('mongoose');
const { Tree, TreeUpdate, Gallery } = require('./server/models');
require('dotenv').config();

async function checkTrees() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gampahin');
  const trees = await Tree.find({});
  console.log(`Total Trees: ${trees.length}`);
  trees.forEach(t => {
    console.log(`Tree: ${t.commonName}, Images Count: ${t.images?.length || 0}`);
  });

  const gallery = await Gallery.find({});
  console.log(`Gallery Items: ${gallery.length}`);

  process.exit(0);
}

checkTrees();
