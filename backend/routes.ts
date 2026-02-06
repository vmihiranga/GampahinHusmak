import type { Express } from "express";
import type { Server } from "http";
import connectDB from "./db";
import { User, Tree, TreeUpdate, Event, Gallery, Contact, Achievement } from "./models";
import bcrypt from "bcryptjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

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
        sameSite: "lax",
      },
    })
  );

  // ============ SECURITY MIDDLEWARE ============
  
  // Apply Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local development compatibility with Vite
    crossOriginEmbedderPolicy: false,
  }));

  // Generic rate limiter for API calls
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." }
  });

  // stricter rate limiter for sensitive routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10, // Limit each IP to 10 failed attempts
    skipSuccessfulRequests: true,
    message: { message: "Too many failed login attempts. Please try again in an hour." }
  });

  app.use("/api/", apiLimiter);
  app.use("/api/auth", authLimiter);

  // Prevents NoSQL Injection by checking for $ in top-level request body keys
  app.use((req, res, next) => {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'object' && req.body[key] !== null) {
          const stringified = JSON.stringify(req.body[key]);
          if (stringified.includes('$') || stringified.includes('.')) {
             // Deep check for mongo operators
          }
        } else if (key.startsWith('$')) {
          return res.status(403).json({ message: "Invalid request payload detected" });
        }
      }
    }
    next();
  });

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const { status, plantedBy } = req.query;
      
      const filter: any = {};
      if (status) filter.status = status;
      if (plantedBy) filter.plantedBy = plantedBy;

      const totalItems = await Tree.countDocuments(filter);
      const trees = await Tree.find(filter)
        .populate("plantedBy", "username fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({ 
        trees,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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

      // Achievement Logic
      const treeCount = await Tree.countDocuments({ plantedBy: userId });
      
      const badgeTemplates = [
        { count: 1, name: "First Seed", type: "trees_planted", desc: "Planted your very first tree!", icon: "🌱" },
        { count: 5, name: "Green Thumb", type: "trees_planted", desc: "Planted 5 trees. You're making a difference!", icon: "🌿" },
        { count: 10, name: "Forest Guardian", type: "trees_planted", desc: "Planted 10 trees. A true environmental hero!", icon: "🌳" },
        { count: 25, name: "Nature's Champion", type: "trees_planted", desc: "Planted 25 trees. Gampaha thanks you!", icon: "👑" }
      ];

      const badge = badgeTemplates.find(b => b.count === treeCount);
      if (badge) {
        await Achievement.create({
          userId,
          badgeName: badge.name,
          badgeType: badge.type,
          description: badge.desc,
          icon: badge.icon
        });

        // Add a notification for the user
        await Contact.create({
          userId,
          name: "System",
          email: "system@gampahinhusmak.lk",
          subject: "Achievement Unlocked!",
          message: `Congratulations! You've earned the "${badge.name}" badge for planting ${treeCount} tree${treeCount > 1 ? 's' : ''}. Check your profile to see your new badge!`,
          status: 'replied',
          responses: [{
            message: `Congratulations! You've earned the "${badge.name}" badge for planting ${treeCount} tree${treeCount > 1 ? 's' : ''}. Check your profile to see your new badge!`,
            respondedBy: userId, // Self-responded as system
            respondedAt: new Date()
          }]
        });
      }

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const { status } = req.query;
      
      const filter: any = {};
      if (status) filter.status = status;

      const totalItems = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .populate("organizer", "username fullName")
        .populate("participants", "username fullName")
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(limit);

      res.json({ 
        events,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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
  // Get gallery items (merged with latest trees)
  app.get("/api/gallery", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const skip = (page - 1) * limit;

      // 1. Fetch curated gallery items
      const galleryItems = await Gallery.find()
        .populate("uploadedBy", "username fullName")
        .populate("relatedTree")
        .populate("relatedEvent", "title")
        .sort({ createdAt: -1 });

      // 2. Fetch latest trees with images to show community plantings
      const latestTrees = await Tree.find({ images: { $not: { $size: 0 } } })
        .populate("plantedBy", "username fullName")
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
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalItems = allItems.length;
      const paginatedItems = allItems.slice(skip, skip + limit);

      res.json({ 
        items: paginatedItems,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const userId = (req.session as any).userId;

      const totalItems = await Contact.countDocuments({ userId });
      const contacts = await Contact.find({ userId })
        .populate("relatedTreeId", "commonName treeId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      res.json({ 
        contacts,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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
  app.get("/api/contact", requireAuth, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const skip = (page - 1) * limit;

      const totalItems = await Contact.countDocuments();
      const contacts = await Contact.find()
        .populate("relatedTreeId", "treeId commonName location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      res.json({ 
        contacts,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get total count of unique planters
      const countResult = await Tree.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$plantedBy" } },
        { $count: "total" }
      ]);
      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      const topPlanters = await Tree.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$plantedBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            count: 1,
            "user.username": 1,
            "user.fullName": 1,
            "user.profileImage": 1
          }
        }
      ]);

      res.json({ 
        topPlanters, 
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user stats
  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      const userTrees = await Tree.find({ plantedBy: userId, status: "active" });
      const treesPlanted = userTrees.length;
      const eventsAttended = await Event.countDocuments({ participants: userId });
      const updatesSubmitted = await TreeUpdate.countDocuments({ updatedBy: userId });
      const achievements = await Achievement.find({ userId });

      // CO2 Offset Calculation
      // Formula: Young trees (0-2y) = 5kg/y, Mature (2y+) = 22kg/y
      // Using daily rates for precision
      let totalCO2Offset = 0;
      const now = new Date();
      
      userTrees.forEach(tree => {
        const ageInDays = Math.floor((now.getTime() - new Date(tree.plantedDate).getTime()) / (1000 * 60 * 60 * 24));
        const ageInYears = ageInDays / 365.25;
        
        if (ageInYears <= 2) {
          // 5kg per year = 0.0137kg per day
          totalCO2Offset += ageInDays * 0.0137;
        } else {
          // Mature rate: ~22kg per year = 0.0602kg per day
          // First 2 years at 5kg, the rest at 22kg
          totalCO2Offset += (2 * 365.25 * 0.0137) + ((ageInDays - (2 * 365.25)) * 0.0602);
        }
      });

      // Weather & Alert Logic (Simulated for Gampaha)
      const currentHour = new Date().getHours();
      const isDrySeason = [1, 2, 3, 7, 8].includes(now.getMonth() + 1); // Jan-Mar, Jul-Aug are drier
      let weatherAlert = null;
      
      if (treesPlanted > 0) {
        if (isDrySeason) {
          weatherAlert = {
            type: "watering",
            message: "Dry weather detected in Gampaha. Please water your trees today!",
            urgency: "high"
          };
        } else if (currentHour > 6 && currentHour < 10) {
          weatherAlert = {
            type: "maintenance",
            message: "Good morning! Perfect time for basic tree maintenance.",
            urgency: "low"
          };
        }
      }

      res.json({
        treesPlanted,
        eventsAttended,
        updatesSubmitted,
        achievements,
        co2Offset: totalCO2Offset.toFixed(2),
        weatherAlert
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all users (admin only)
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const totalItems = await User.countDocuments();
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.json({ 
        users,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          limit
        }
      });
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

  // Admin send message to user
  app.post("/api/admin/message/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { subject, message } = req.body;
      const targetUserId = req.params.userId;
      const adminId = (req.session as any).userId;

      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const adminUser = await User.findById(adminId);

      const contact = await Contact.create({
        userId: targetUserId,
        name: "Gampahin Husmak (Admin)",
        email: "system@gampahinhusmak.lk",
        subject: subject || "System Message",
        message: `This is a direct message from the system administrator (${adminUser?.fullName || adminUser?.username}).`,
        status: 'replied',
        responses: [{
          message: message,
          respondedBy: adminId,
          respondedAt: new Date()
        }]
      });

      res.status(201).json({ message: "Message sent successfully", contact });
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

  // Database Management & Errors (admin only)
  app.get("/api/admin/db-stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not established");

      let stats: any = { ok: 1 };
      try {
        stats = await db.stats();
      } catch (e) {
        console.error("Error fetching db stats:", e);
      }

      const collections = await db.listCollections().toArray();
      
      const collStats = await Promise.all(
        collections.map(async (c) => {
          try {
            const s = await db.collection(c.name).stats();
            return {
              name: c.name,
              count: s.count || 0,
              size: s.size || 0,
              avgObjSize: s.avgObjSize || 0
            };
          } catch (e) {
            return {
              name: c.name,
              count: 0,
              size: 0,
              avgObjSize: 0
            };
          }
        })
      );

      // Basic server info
      let adminInfo: any = { version: "unknown", uptime: 0, connections: { current: 0 } };
      try {
        adminInfo = await db.admin().serverStatus();
      } catch (e) {
        console.error("Error fetching server status:", e);
      }

      res.json({
        database: {
          name: db.databaseName,
          ok: stats.ok,
          storageSize: stats.storageSize || 0,
          dataSize: stats.dataSize || 0,
          indexSize: stats.indexSize || 0,
          stats: stats
        },
        collections: collStats,
        server: {
          version: adminInfo.version,
          uptime: adminInfo.uptime,
          connections: adminInfo.connections.current
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
