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
      const { limit = 20 } = req.query;

      const items = await Gallery.find()
        .populate("uploadedBy", "username fullName")
        .populate("relatedTree", "treeId species")
        .populate("relatedEvent", "title")
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      res.json({ items });
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
      const contact = await Contact.create(req.body);
      res.status(201).json({ message: "Message sent successfully", contact });
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

      const contacts = await Contact.find().sort({ createdAt: -1 });
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

  return httpServer;
}
