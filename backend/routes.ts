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
import crypto from "crypto";
import sanitize from "mongo-sanitize";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log('🚀 Initializing server routes...');

  // Connect to MongoDB
  await connectDB();

  console.log('🔐 Configuring security and sessions...');
  // Generate a random session secret if not provided in env
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex");

  // Session configuration
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        touchAfter: 24 * 3600, // lazy session update
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days (Remember Me)
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );

  // ============ SECURITY MIDDLEWARE ============
  console.log('🛡️  Applying security headers and rate limiters...');
  
  // Apply Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local development compatibility with Vite
    crossOriginEmbedderPolicy: false,
  }));

  // Generic rate limiter for API calls
  const apiLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." }
  });

  // stricter rate limiter for sensitive routes
  const authLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    limit: 10, // Limit each IP to 10 failed attempts
    skipSuccessfulRequests: true,
    message: { message: "Too many failed login attempts. Please try again in 5 seconds." }
  });

  app.use("/api/", apiLimiter);
  app.use("/api/auth", authLimiter);
 
 
  // Prevents NoSQL Injection
  app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        req.query[key] = sanitize(req.query[key]);
      });
    }
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        req.params[key] = sanitize(req.params[key]);
      });
    }
    next();
  });

  // ============ MIDDLEWARE ============
  
  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = (req.session as any).userId;
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

  // register actual routes
  console.log('🚥 Registering API endpoints...');
  
  // ============ AUTH ROUTES ============
  console.log('🔑 Setting up Auth routes...');
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, phoneNumber, address, profileImage } = req.body;
      console.log(`📝 New registration request: ${username} (${email})`);

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
        role: "volunteer",
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email OR username
      const user = await User.findOne({ 
        $or: [
          { email: email },
          { username: email } // Allow login with username in the email field
        ]
      });
      
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
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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

      // Privacy Filter: Regular users only see their own trees
      // Admins and Superadmins can see everything
      const userId = (req.session as any).userId;
      const user = userId ? await User.findById(userId) : null;

      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        // If not logged in or not admin, only show their own trees
        if (!userId) {
          return res.json({ 
            trees: [], 
            pagination: { totalItems: 0, totalPages: 0, currentPage: page, limit } 
          });
        }
        filter.plantedBy = userId;
      } else if (plantedBy) {
        // Admins can filter by a specific user if requested
        filter.plantedBy = plantedBy;
      }

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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Update tree
  app.put("/api/trees/:id", requireAuth, async (req, res) => {
    try {
      const tree = await Tree.findById(req.params.id);
      if (!tree) return res.status(404).json({ message: "Tree not found" });

      // Only owner or superadmin can edit
      if (tree.plantedBy.toString() !== req.user._id.toString() && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to edit this tree" });
      }

      Object.assign(tree, req.body);
      await tree.save();

      res.json({ message: "Tree updated successfully", tree });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // ============ STATS ROUTES ============

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const activeTrees = await Tree.countDocuments({ status: "active" });
      const deadTrees = await Tree.countDocuments({ status: "dead" });
      const totalTrees = activeTrees + deadTrees;
      const survivalRate = totalTrees > 0 
        ? Math.round((activeTrees / totalTrees) * 100) 
        : 100;
      const totalUsers = await User.countDocuments({ role: "volunteer" });
      const totalEvents = await Event.countDocuments();
      const upcomingEvents = await Event.countDocuments({ status: "upcoming" });
      
      const recentTrees = await Tree.find({ status: "active" })
        .limit(5)
        .sort({ createdAt: -1 })
        .populate("plantedBy", "username fullName");

      res.json({
        totalTrees: activeTrees,
        totalUsers,
        totalEvents,
        upcomingEvents,
        recentTrees,
        survivalRate: `${survivalRate}%`,
        co2Offset: `${(activeTrees * 22).toFixed(1)} kg/year`, // Approximate
      });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
        // Exclude admin and superadmin from leaderboard
        { $match: { "user.role": { $nin: ["admin", "superadmin"] } } },
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all users (admin only)
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const totalItems = await User.countDocuments({ role: "volunteer" });
      const users = await User.find({ role: "volunteer" })
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Get admin dashboard summary
  app.get("/api/admin/summary", requireAuth, requireAdmin, async (req, res) => {
    try {
      const totalTrees = await Tree.countDocuments();
      const activeTrees = await Tree.countDocuments({ status: "active" });
      const totalUsers = await User.countDocuments({ role: "volunteer" });
      const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
      const totalEvents = await Event.countDocuments();
      const upcomingEvents = await Event.countDocuments({ status: "upcoming" });
      const pendingContacts = await Contact.countDocuments({ status: "new" });
      
      // Recent activity
      const recentUsers = await User.find({ role: "volunteer" })
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Delete User (Super Admin only)
  app.delete("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      // Also cleanup trees and other things if necessary
      await Tree.deleteMany({ plantedBy: req.params.id });
      await Contact.deleteMany({ userId: req.params.id });
      await Achievement.deleteMany({ userId: req.params.id });

      res.json({ message: "User and their data deleted successfully" });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Update user details (Super Admin only)
  app.put("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User updated successfully", user });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Change user role (Super Admin only)
  app.put("/api/admin/users/:id/role", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['volunteer', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: `User role updated to ${role}`, user });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Delete Tree (Super Admin only)
  app.delete("/api/admin/trees/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const tree = await Tree.findByIdAndDelete(req.params.id);
      if (!tree) return res.status(404).json({ message: "Tree not found" });
      
      // Cleanup updates
      await TreeUpdate.deleteMany({ treeId: req.params.id });
      
      res.json({ message: "Tree deleted successfully" });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  // Database Management & Errors (admin only)
  app.get("/api/admin/db-stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not established");

      let stats: any = { ok: 1 };
      try {
        stats = await db.command({ dbStats: 1 });
      } catch (e) {
        console.error("Error fetching db stats:", e);
      }

      const collections = await db.listCollections().toArray();
      
      const collStats = await Promise.all(
        collections.map(async (c) => {
          try {
            // Get accurate count
            const count = await db.collection(c.name).countDocuments();
            
            // Try to get storage stats, but provide fallback
            let size = 0;
            let avgObjSize = 0;
            try {
              const s = await db.command({ collStats: c.name });
              size = s.size || 0;
              avgObjSize = s.avgObjSize || 0;
            } catch (e) {
              // Silently fail storage stats, keep count
            }

            return {
              name: c.name,
              count: count,
              size: size,
              avgObjSize: avgObjSize
            };
          } catch (e) {
            console.error(`Error fetching stats for collection ${c.name}:`, e);
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
      console.error("API Error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  });

  return httpServer;
}
