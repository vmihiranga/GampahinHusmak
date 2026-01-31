import type { Express } from "express";
import type { Server } from "http";
import connectDB from "./db";
import { User, Tree, TreeUpdate, Event, Gallery, Contact, Achievement } from "./models";
import bcrypt from "bcryptjs";
import session from "express-session";
import MongoStore from "connect-mongo";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "gampahin-secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        touchAfter: 24 * 3600, // lazy session update
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // ============ MIDDLEWARE ============
  
  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  };

  // Admin authorization middleware (admin or superadmin)
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }
    
    next();
  };

  // Super Admin authorization middleware
  const requireSuperAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Unauthorized - Super Admin access required" });
    }
    
    next();
  };

  // ============ AUTH ROUTES ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, phoneNumber, address, profileImage } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        address,
        profileImage,
        role: "user",
      });

      // Set session
      (req.session as any).userId = user._id;

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user._id;

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ TREE ROUTES ============

  // Get all trees
  app.get("/api/trees", async (req, res) => {
    try {
      const { status, plantedBy, limit = 50 } = req.query;
      const filter: any = {};
      
      if (status) filter.status = status;
      if (plantedBy) filter.plantedBy = plantedBy;

      const trees = await Tree.find(filter)
        .populate("plantedBy", "username fullName")
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      res.json({ trees });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single tree
  app.get("/api/trees/:id", async (req, res) => {
    try {
      const tree = await Tree.findById(req.params.id)
        .populate("plantedBy", "username fullName email phoneNumber");
      
      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }

      // Get updates for this tree
      const updates = await TreeUpdate.find({ treeId: tree._id })
        .populate("updatedBy", "username fullName")
        .sort({ updateDate: -1 });

      res.json({ tree, updates });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create tree
  app.post("/api/trees", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const treeId = `TREE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const tree = await Tree.create({
        ...req.body,
        treeId,
        plantedBy: userId,
      });

      res.status(201).json({ message: "Tree registered successfully", tree });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update tree
  app.put("/api/trees/:id", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const tree = await Tree.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }

      res.json({ message: "Tree updated successfully", tree });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add tree update/progress
  app.post("/api/trees/:id/updates", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const tree = await Tree.findById(req.params.id);
      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }

      const update = await TreeUpdate.create({
        treeId: tree._id,
        updatedBy: userId,
        ...req.body,
      });

      // Update tree's current status
      if (req.body.height) tree.currentHeight = req.body.height;
      if (req.body.health) tree.currentHealth = req.body.health;
      await tree.save();

      res.status(201).json({ message: "Update added successfully", update });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ EVENT ROUTES ============

  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const { status } = req.query;
      const filter: any = {};
      
      if (status) filter.status = status;

      const events = await Event.find(filter)
        .populate("organizer", "username fullName")
        .populate("participants", "username fullName")
        .sort({ eventDate: -1 });

      res.json({ events });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate("organizer", "username fullName email phoneNumber")
        .populate("participants", "username fullName");

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({ event });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const event = await Event.create({
        ...req.body,
        organizer: userId,
      });

      res.status(201).json({ message: "Event created successfully", event });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Join event
  app.post("/api/events/:id/join", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.participants.includes(userId)) {
        return res.status(400).json({ message: "Already joined this event" });
      }

      if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full" });
      }

      event.participants.push(userId);
      await event.save();

      res.json({ message: "Joined event successfully", event });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ GALLERY ROUTES ============

  // Get gallery items
  app.get("/api/gallery", async (req, res) => {
    try {
      const { limit = 30 } = req.query;

      // 1. Fetch curated gallery items
      const galleryItems = await Gallery.find()
        .populate("uploadedBy", "username fullName")
        .populate("relatedTree")
        .populate("relatedEvent", "title")
        .sort({ createdAt: -1 });

      // 2. Fetch latest trees with images to show community plantings
      const latestTrees = await Tree.find({ images: { $not: { $size: 0 } } })
        .populate("plantedBy", "username fullName")
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      // 3. Process curated items to include growth updates
      const processedCurated = await Promise.all(
        galleryItems.map(async (item: any) => {
          let allImages = [...(item.images || [])];
          
          if (item.relatedTree) {
            const updates = await TreeUpdate.find({ treeId: item.relatedTree._id }).sort({ updateDate: 1 });
            const updateImages = updates.flatMap(u => u.images || []);
            allImages = Array.from(new Set([...allImages, ...updateImages]));
          }
          
          return {
            ...item.toObject(),
            images: allImages
          };
        })
      );

      // 4. Create items for trees not already in gallery
      const curatedTreeIds = galleryItems
        .filter(item => item.relatedTree)
        .map(item => item.relatedTree._id.toString());

      const treeGalleryItems = await Promise.all(
        latestTrees
          .filter(tree => !curatedTreeIds.includes(tree._id.toString()))
          .map(async (tree) => {
            const updates = await TreeUpdate.find({ treeId: tree._id }).sort({ updateDate: 1 });
            const updateImages = updates.flatMap(u => u.images || []);
            const allImages = Array.from(new Set([...(tree.images || []), ...updateImages]));

            return {
              _id: tree._id,
              title: `${tree.commonName} Planting`,
              description: tree.notes || `A young ${tree.commonName} tree planted in Gampaha.`,
              images: allImages,
              uploadedBy: tree.plantedBy,
              relatedTree: tree,
              tags: ["community", tree.commonName.toLowerCase()],
              createdAt: tree.createdAt,
              likes: [],
              isCommunityPost: true
            };
          })
      );

      const allItems = [...processedCurated, ...treeGalleryItems]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, Number(limit));

      res.json({ items: allItems });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload to gallery
  app.post("/api/gallery", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const item = await Gallery.create({
        ...req.body,
        uploadedBy: userId,
      });

      res.status(201).json({ message: "Gallery item created", item });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Like gallery item
  app.post("/api/gallery/:id/like", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const item = await Gallery.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }

      const likeIndex = item.likes.indexOf(userId);
      if (likeIndex > -1) {
        item.likes.splice(likeIndex, 1);
      } else {
        item.likes.push(userId);
      }

      await item.save();
      res.json({ message: "Like toggled", likes: item.likes.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ CONTACT ROUTES ============

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const contactData = { ...req.body };
      if (userId) contactData.userId = userId;
      
      const contact = await Contact.create(contactData);
      res.status(201).json({ message: "Message sent successfully", contact });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's own contacts
  app.get("/api/my-contacts", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const contacts = await Contact.find({ userId })
        .populate("relatedTreeId", "commonName treeId")
        .sort({ createdAt: -1 });
      res.json({ contacts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mark contact as seen by user
  app.put("/api/my-contacts/:id/seen", requireAuth, async (req, res) => {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: req.params.id, userId: (req.session as any).userId },
        { status: 'seen' },
        { new: true }
      );
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json({ message: "Marked as seen", contact });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all contacts (admin only)
  app.get("/api/contact", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await User.findById(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const contacts = await Contact.find()
        .populate("relatedTreeId", "treeId commonName location")
        .sort({ createdAt: -1 });
      res.json({ contacts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ STATS ROUTES ============

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const totalTrees = await Tree.countDocuments({ status: "active" });
      const totalUsers = await User.countDocuments();
      const totalEvents = await Event.countDocuments();
      const upcomingEvents = await Event.countDocuments({ status: "upcoming" });
      
      const recentTrees = await Tree.find({ status: "active" })
        .limit(5)
        .sort({ createdAt: -1 })
        .populate("plantedBy", "username fullName");

      res.json({
        totalTrees,
        totalUsers,
        totalEvents,
        upcomingEvents,
        recentTrees,
        co2Offset: `${(totalTrees * 22).toFixed(1)} kg/year`, // Approximate
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user stats
  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      const treesPlanted = await Tree.countDocuments({ plantedBy: userId, status: "active" });
      const eventsAttended = await Event.countDocuments({ participants: userId });
      const updatesSubmitted = await TreeUpdate.countDocuments({ updatedBy: userId });
      const achievements = await Achievement.find({ userId });

      res.json({
        treesPlanted,
        eventsAttended,
        updatesSubmitted,
        achievements,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all users (admin only)
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
      
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user role (superadmin only)
  app.put("/api/admin/users/:id/role", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!['user', 'admin', 'volunteer', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User role updated", user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get admin dashboard summary
  app.get("/api/admin/summary", requireAuth, requireAdmin, async (req, res) => {
    try {
      const totalTrees = await Tree.countDocuments();
      const activeTrees = await Tree.countDocuments({ status: "active" });
      const totalUsers = await User.countDocuments();
      const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
      const totalEvents = await Event.countDocuments();
      const upcomingEvents = await Event.countDocuments({ status: "upcoming" });
      const pendingContacts = await Contact.countDocuments({ status: "new" });
      
      // Recent activity
      const recentUsers = await User.find()
        .select("-password")
        .limit(5)
        .sort({ createdAt: -1 });
      
      const recentTrees = await Tree.find()
        .limit(5)
        .sort({ createdAt: -1 })
        .populate("plantedBy", "username fullName");

      res.json({
        stats: {
          totalTrees,
          activeTrees,
          totalUsers,
          totalAdmins,
          totalEvents,
          upcomingEvents,
          pendingContacts,
        },
        recentUsers,
        recentTrees,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete user (superadmin only)
  app.delete("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify user (admin only)
  app.put("/api/admin/users/:id/verify", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { isVerified } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isVerified },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: `User ${isVerified ? 'verified' : 'unverified'} successfully`, user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update contact status (admin only)
  app.put("/api/admin/contacts/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json({ message: "Status updated", contact });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Respond to contact (admin only)
  app.post("/api/admin/contacts/:id/respond", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { reply } = req.body;
      const userId = (req.session as any).userId;
      
      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { 
          $set: { 
            status: 'replied',
            reply, // Update legacy fields
            repliedBy: userId,
            repliedAt: new Date()
          },
          $push: { 
            responses: {
              message: reply,
              respondedBy: userId,
              respondedAt: new Date()
            }
          }
        },
        { new: true }
      );
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json({ message: "Response recorded", contact });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send update reminder for a tree (admin only)
  app.post("/api/admin/trees/:id/remind", requireAuth, requireAdmin, async (req, res) => {
    try {
      const tree = await Tree.findById(req.params.id);
      if (!tree) return res.status(404).json({ message: "Tree not found" });

      const adminId = (req.session as any).userId;
      const admin = await User.findById(adminId);

      // Create a contact message targeted to the user
      await Contact.create({
        userId: tree.plantedBy,
        relatedTreeId: tree._id,
        name: "District Administrator",
        email: admin?.email || "admin@gampahinhusmak.lk",
        subject: `Update Reminder: ${tree.commonName}`,
        message: `Hello! Please take a moment to update your ${tree.commonName}. Uploading regular updates helps us track the reforestation progress.`,
        status: 'replied', // Set to replied so it shows as a notification badge
        responses: [{
          message: `Hello! Please take a moment to update your ${tree.commonName}. Uploading regular updates helps us track the reforestation progress.`,
          respondedBy: adminId,
          respondedAt: new Date()
        }]
      });

      res.json({ message: "Reminder sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
