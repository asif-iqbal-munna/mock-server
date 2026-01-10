// server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const rateLimit = require("express-rate-limit");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use("/api/", limiter);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/practice-scenarios",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==================== SCHEMAS ====================

// User Schema (Scenarios 4, 7, 10)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// Form Submission Schema (Scenario 1 - Duplicate Prevention)
const formSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  formData: { type: Object, required: true },
  submissionHash: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Product Schema (Scenario 2 - Large List Search)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  stock: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

// Order Schema (Scenario 6 - Real-time Updates)
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{ productId: String, quantity: Number, price: Number }],
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  total: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Blog Post Schema (Scenario 9 - SEO)
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  metaTitle: String,
  metaDescription: String,
  tags: [String],
  published: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

// ==================== MIDDLEWARE ====================

// Authentication Middleware (Scenarios 4, 10)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Role-based Authorization (Scenario 10)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Idempotency Middleware (Scenario 1)
const idempotencyCheck = async (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency-Key header required" });
  }

  try {
    const existing = await FormSubmission.findOne({
      submissionHash: idempotencyKey,
    });
    if (existing) {
      return res.status(200).json({
        message: "Duplicate submission prevented",
        data: existing,
        duplicate: true,
      });
    }
    req.idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    next(error);
  }
};

// ==================== AUTH ROUTES (Scenarios 4, 7, 10) ====================

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User (Scenario 4, 7)
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FORM SUBMISSION (Scenario 1) ====================

app.post(
  "/api/forms/submit",
  authenticateToken,
  idempotencyCheck,
  async (req, res) => {
    try {
      const submission = new FormSubmission({
        userId: req.user.id,
        formData: req.body.formData,
        submissionHash: req.idempotencyKey,
      });

      await submission.save();

      res.status(201).json({
        message: "Form submitted successfully",
        data: submission,
        duplicate: false,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== PRODUCTS (Scenario 2, 3) ====================

// Search Products with Pagination (Scenario 2)
app.get("/api/products/search", async (req, res) => {
  try {
    const {
      q = "",
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Product with Inconsistent Data Handling (Scenario 3)
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Simulate inconsistent data - sometimes fields are missing
    const shouldSimulateInconsistency = Math.random() > 0.7;

    if (shouldSimulateInconsistency) {
      delete product.imageUrl;
      delete product.description;
    }

    res.json({
      ...product,
      // Provide safe defaults for potentially missing fields
      imageUrl: product.imageUrl || null,
      description: product.description || null,
      stock: product.stock ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Product (Admin Only - Scenario 10)
app.post(
  "/api/products",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== ORDERS (Scenario 6 - Real-time Updates) ====================

// Create Order
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const order = new Order({
      userId: req.user.id,
      items: req.body.items,
      total: req.body.total,
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Order with Status
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status (Admin - Scenario 6)
app.patch(
  "/api/orders/:id/status",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== BLOG POSTS (Scenario 9 - SEO) ====================

// Get All Published Posts
app.get("/api/blog/posts", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      BlogPost.find({ published: true })
        .select("title slug excerpt author tags publishedAt")
        .populate("author", "email")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      BlogPost.countDocuments({ published: true }),
    ]);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Post by Slug (for SEO)
app.get("/api/blog/posts/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      published: true,
    })
      .populate("author", "email")
      .lean();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Blog Post (Admin Only)
app.post(
  "/api/blog/posts",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const post = new BlogPost({
        ...req.body,
        author: req.user.id,
        publishedAt: req.body.published ? new Date() : null,
      });

      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== SEED DATA ROUTE ====================

app.post("/api/seed", async (req, res) => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      BlogPost.deleteMany({}),
    ]);

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    const user = await User.create({
      email: "user@example.com",
      password: userPassword,
      role: "user",
    });

    // Create products
    const products = [];
    const categories = ["Electronics", "Clothing", "Books", "Home", "Sports"];

    for (let i = 1; i <= 100; i++) {
      products.push({
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: Math.floor(Math.random() * 1000) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        stock: Math.floor(Math.random() * 100),
        imageUrl: `https://picsum.photos/seed/${i}/400/300`,
      });
    }

    await Product.insertMany(products);

    // Create blog posts
    const posts = [];
    for (let i = 1; i <= 20; i++) {
      posts.push({
        title: `Blog Post ${i}`,
        slug: `blog-post-${i}`,
        content: `This is the content for blog post ${i}. `.repeat(50),
        excerpt: `This is an excerpt for blog post ${i}`,
        author: admin._id,
        metaTitle: `Blog Post ${i} - SEO Title`,
        metaDescription: `Meta description for blog post ${i}`,
        tags: ["technology", "programming", "web development"],
        published: true,
        publishedAt: new Date(),
      });
    }

    await BlogPost.insertMany(posts);

    res.json({
      message: "Database seeded successfully",
      credentials: {
        admin: { email: "admin@example.com", password: "admin123" },
        user: { email: "user@example.com", password: "user123" },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`
    API Endpoints:
    - POST /api/auth/register
    - POST /api/auth/login
    - GET  /api/auth/me
    - POST /api/forms/submit (with Idempotency-Key header)
    - GET  /api/products/search?q=&page=1&limit=20
    - GET  /api/products/:id
    - POST /api/products (admin only)
    - POST /api/orders
    - GET  /api/orders
    - GET  /api/orders/:id
    - PATCH /api/orders/:id/status (admin only)
    - GET  /api/blog/posts
    - GET  /api/blog/posts/:slug
    - POST /api/blog/posts (admin only)
    - POST /api/seed (seed database with test data)
  `);
});
