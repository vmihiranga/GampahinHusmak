Gallery එක සඳහා වෙනම table එකක් අවශ්‍ය නැත. Trees table එකෙන් විතරක් gallery images ගන්න හදන්න ඕන.

Backend routes.ts file එකේ `/api/gallery` endpoint එක update කරන්න:

**ඉවත් කරන්න:**

- Gallery.find() calls
- Gallery model usage
- processedCurated variable

**තබා ගන්න:**

- Trees table එකෙන් images fetch කරන logic
- TreeUpdate එකෙන් additional images ගන්න logic

**Final endpoint structure:**

```typescript
app.get("/api/gallery", async (req, res) => {
  // Only fetch from Trees table
  const trees = await Tree.find({ images: { $not: { $size: 0 } } })
    .populate("plantedBy")
    .sort({ createdAt: -1 });

  // Process to include update images
  const items = await Promise.all(
    trees.map(async (tree) => {
      const updates = await TreeUpdate.find({ treeId: tree._id });
      // Combine tree images + update images
    }),
  );

  res.json({ items });
});
```

මේ approach එකෙන්:

- Gallery table එක අවශ්‍ය නැහැ
- Trees table එක single source of truth
- Simpler codebase
