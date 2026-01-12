import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Product, BlogPost, Order, FormSubmission } from "../models";

/**
 * Seed Database with Practice Scenario Data
 * This seeds the database with realistic test data for all 10 practice scenarios
 */
export const seedDatabase = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      BlogPost.deleteMany({}),
      Order.deleteMany({}),
      FormSubmission.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data");

    // ==================== SCENARIO 4, 7, 10: Users (Auth & Roles) ====================
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    const regularUser = await User.create({
      email: "user@example.com",
      password: userPassword,
      role: "user",
    });

    const numAdditionalUsers = Math.floor(Math.random() * (50 - 30 + 1)) + 30; // Between 30 and 50
    const additionalUsersData = [];
    for (let i = 0; i < numAdditionalUsers; i++) {
      additionalUsersData.push({
        email: `user${i}@example.com`,
        password: userPassword,
        role: i % 5 === 0 ? "admin" : "user", // Roughly 20% admins
      });
    }

    const testUsers = await User.insertMany(additionalUsersData);

    console.log("✅ Created users (Scenarios 4, 7, 10)");

    const categories = [
      "Electronics",
      "Clothing",
      "Books",
      "Home & Garden",
      "Sports & Outdoors",
      "Toys & Games",
      "Beauty & Health",
      "Automotive",
      "Food & Grocery",
      "Pet Supplies",
    ];

    const productNames = {
      Electronics: [
        "Wireless Headphones",
        "Smart Watch",
        "Laptop",
        "Tablet",
        "Camera",
        "Gaming Console",
        "Monitor",
        "Keyboard",
        "Mouse",
        "Speaker",
      ],
      Clothing: [
        "T-Shirt",
        "Jeans",
        "Jacket",
        "Sneakers",
        "Dress",
        "Hoodie",
        "Shorts",
        "Hat",
        "Socks",
        "Backpack",
      ],
      Books: [
        "Fiction Novel",
        "Programming Guide",
        "Cookbook",
        "Biography",
        "Mystery Thriller",
        "Self-Help Book",
        "History Book",
        "Science Fiction",
        "Poetry Collection",
        "Business Book",
      ],
      "Home & Garden": [
        "Coffee Maker",
        "Vacuum Cleaner",
        "Plant Pot",
        "Lamp",
        "Bedding Set",
        "Kitchen Knife Set",
        "Storage Box",
        "Curtains",
        "Rug",
        "Wall Art",
      ],
      "Sports & Outdoors": [
        "Yoga Mat",
        "Dumbbells",
        "Running Shoes",
        "Tent",
        "Bicycle",
        "Basketball",
        "Swimming Goggles",
        "Hiking Backpack",
        "Water Bottle",
        "Jump Rope",
      ],
    };

    const TOTAL_PRODUCTS = 20_000;
    const PRODUCT_BATCH_SIZE = 500;

    let productCounter = 1;
    let productBatch: any[] = [];
    let createdProducts: any[] = [];

    for (let i = 0; i < TOTAL_PRODUCTS; i++) {
      const category = categories[i % categories.length];
      const categoryProducts =
        productNames[category as keyof typeof productNames] ||
        productNames.Electronics;

      const baseName = categoryProducts[i % categoryProducts.length];

      productBatch.push({
        name: `${baseName} ${productCounter}`,
        description: `High-quality ${baseName.toLowerCase()} with premium features. Perfect for ${category.toLowerCase()} enthusiasts. Model #${productCounter}`,
        price: Math.floor(Math.random() * 2000) + 10,
        category,
        stock: Math.floor(Math.random() * 150),
        imageUrl: `https://picsum.photos/seed/${productCounter}/400/300`,
      });

      productCounter++;

      if (productBatch.length === PRODUCT_BATCH_SIZE) {
        const inserted = await Product.insertMany(productBatch, {
          ordered: false,
        });
        createdProducts.push(...inserted);
        productBatch = [];
      }
    }

    // Insert remaining products
    if (productBatch.length > 0) {
      const inserted = await Product.insertMany(productBatch, {
        ordered: false,
      });
      createdProducts.push(...inserted);
    }

    console.log(
      "✅ Created 20,000 products (Scenario 2: Search & Performance)"
    );

    // ==================== SCENARIO 6: Orders for Real-time Updates ====================
    const orderStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ] as const;

    const TOTAL_ORDERS = 2_000;
    const ORDER_BATCH_SIZE = 200;

    let ordersBatch: any[] = [];

    for (let i = 0; i < TOTAL_ORDERS; i++) {
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let total = 0;

      for (let j = 0; j < itemsCount; j++) {
        const randomProduct =
          createdProducts[Math.floor(Math.random() * createdProducts.length)];

        const quantity = Math.floor(Math.random() * 3) + 1;

        items.push({
          productId: randomProduct._id,
          quantity,
          price: randomProduct.price,
        });

        total += randomProduct.price * quantity;
      }

      ordersBatch.push({
        userId: i % 2 === 0 ? regularUser._id : testUsers[0]._id,
        items,
        status: orderStatuses[i % orderStatuses.length],
        total,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      });

      if (ordersBatch.length === ORDER_BATCH_SIZE) {
        await Order.insertMany(ordersBatch, { ordered: false });
        ordersBatch = [];
      }
    }

    // Insert remaining orders
    if (ordersBatch.length > 0) {
      await Order.insertMany(ordersBatch, { ordered: false });
    }

    console.log("✅ Created 2,000 orders (Scenario 6: Real-time Updates)");

    // ==================== SCENARIO 9: Blog Posts for SEO ====================
    const blogTopics = [
      "Web Development Best Practices",
      "React Performance Optimization",
      "TypeScript Tips and Tricks",
      "Node.js Security Guide",
      "MongoDB Schema Design",
      "REST API Design Patterns",
      "Authentication Strategies",
      "State Management in React",
      "Microservices Architecture",
      "Docker for Developers",
      "GraphQL vs REST",
      "Testing Strategies",
      "CI/CD Pipeline Setup",
      "Cloud Deployment Guide",
      "Responsive Design Principles",
    ];

    const blogPosts = blogTopics.map((topic, i) => {
      const slug = topic.toLowerCase().replace(/\s+/g, "-");

      return {
        title: topic,
        slug,
        content: `# ${topic}

## Introduction
This is a comprehensive guide about ${topic.toLowerCase()}. In this article, we'll explore various aspects and best practices.

## Key Concepts
${topic} involves several important considerations that every developer should understand. Let's dive into the details.

### Section 1: Getting Started
When working with ${topic.toLowerCase()}, it's essential to understand the fundamentals first. This foundation will help you make better architectural decisions.

### Section 2: Advanced Techniques
Once you've mastered the basics, you can explore more advanced patterns and techniques that will take your skills to the next level.

### Section 3: Common Pitfalls
Be aware of these common mistakes that developers often make when implementing ${topic.toLowerCase()}.

## Best Practices
1. Always follow industry standards
2. Write clean and maintainable code
3. Test your implementations thoroughly
4. Document your work properly
5. Keep security in mind

## Conclusion
Understanding ${topic.toLowerCase()} is crucial for modern web development. By following the guidelines in this article, you'll be well-equipped to handle real-world challenges.

## Further Reading
- Official documentation
- Community resources
- Related tutorials`,
        excerpt: `Learn everything you need to know about ${topic.toLowerCase()} with practical examples and best practices.`,
        author: admin._id,
        metaTitle: `${topic} - Complete Guide | Dev Blog`,
        metaDescription: `Comprehensive guide to ${topic.toLowerCase()}. Learn best practices, common pitfalls, and advanced techniques with real-world examples.`,
        tags: ["programming", "web development", "tutorial", "best practices"],
        published: i < 12, // First 12 are published, rest are drafts
        publishedAt:
          i < 12
            ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
            : undefined,
      };
    });

    await BlogPost.insertMany(blogPosts);
    console.log("✅ Created 15 blog posts (Scenario 9: SEO)");

    // ==================== SCENARIO 1: Form Submissions (Duplicate Prevention) ====================
    // Pre-seed some submissions to test idempotency
    const formSubmissions = [
      {
        userId: regularUser._id,
        formData: {
          name: "John Doe",
          email: "john@example.com",
          message: "First test submission",
        },
        submissionHash: "test-hash-001",
      },
      {
        userId: regularUser._id,
        formData: {
          name: "Jane Smith",
          email: "jane@example.com",
          message: "Second test submission",
        },
        submissionHash: "test-hash-002",
      },
      {
        userId: testUsers[0]._id,
        formData: {
          name: "Alice Johnson",
          email: "alice@example.com",
          message: "Third test submission",
        },
        submissionHash: "test-hash-003",
      },
    ];

    await FormSubmission.insertMany(formSubmissions);
    console.log(
      "✅ Created sample form submissions (Scenario 1: Duplicate Prevention)"
    );

    // ==================== Summary ====================
    const summary = {
      message: "🎉 Database seeded successfully!",
      scenarios: {
        scenario1: {
          name: "Duplicate Form Submissions",
          data: "3 pre-existing form submissions",
          testWith: "POST /api/forms/submit with Idempotency-Key header",
        },
        scenario2: {
          name: "Large Product Search",
          data: "200+ products across 10 categories",
          testWith: "GET /api/products/search?q=&page=1&limit=20",
        },
        scenario3: {
          name: "Inconsistent API Data",
          data: "Products with missing imageUrl, description, stock",
          testWith: "GET /api/products/:id (random data inconsistency)",
        },
        scenario4: {
          name: "Authentication-based Content",
          data: "5 users (2 admins, 3 regular users)",
          testWith: "POST /api/auth/login, GET /api/auth/me",
        },
        scenario5: {
          name: "Performance & Caching",
          data: "All endpoints support caching",
          testWith: "Any endpoint with React Query or SWR",
        },
        scenario6: {
          name: "Real-time Order Updates",
          data: "30 orders with 5 different statuses",
          testWith: "GET /api/orders/:id (implement polling)",
        },
        scenario7: {
          name: "Cross-component State",
          data: "User auth state, orders, products",
          testWith: "Context API, Redux, or Zustand",
        },
        scenario8: {
          name: "Multiple API Call Debugging",
          data: "All endpoints available for testing",
          testWith: "Check Network tab in DevTools",
        },
        scenario9: {
          name: "SEO Optimization",
          data: "15 blog posts with meta tags and slugs",
          testWith: "GET /api/blog/posts, GET /api/blog/posts/:slug",
        },
        scenario10: {
          name: "Role-based Access Control",
          data: "Admin and user roles with protected routes",
          testWith: "Admin-only endpoints (POST /api/products)",
        },
      },
      credentials: {
        admin: {
          email: "admin@example.com",
          password: "admin123",
          role: "admin",
        },
        user: {
          email: "user@example.com",
          password: "user123",
          role: "user",
        },
        additionalUsers: "Dynamically generated (30-50 users)",
      },
      statistics: {
        users: 2 + numAdditionalUsers,
        products: 203,
        orders: 30,
        blogPosts: 15,
        formSubmissions: 3,
      },
      nextSteps: [
        "1. Login with any user credentials",
        "2. Get JWT token from response",
        "3. Use token in Authorization header: Bearer <token>",
        "4. Start testing scenarios in your frontend",
        "5. Check Network tab to debug API calls",
      ],
    };

    console.log("✅ Database seeding completed!");
    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    res.status(500).json({
      error: "Seeding failed",
      message: (error as Error).message,
    });
  }
};

/**
 * Clear all data from database
 */
export const clearDatabase = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      BlogPost.deleteMany({}),
      Order.deleteMany({}),
      FormSubmission.deleteMany({}),
    ]);

    res.json({
      message: "Database cleared successfully",
      cleared: [
        "users",
        "products",
        "orders",
        "blog posts",
        "form submissions",
      ],
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      blogPostCount,
      formSubmissionCount,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      BlogPost.countDocuments(),
      FormSubmission.countDocuments(),
    ]);

    res.json({
      statistics: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        blogPosts: blogPostCount,
        formSubmissions: formSubmissionCount,
        total:
          userCount +
          productCount +
          orderCount +
          blogPostCount +
          formSubmissionCount,
      },
      isEmpty: userCount === 0 && productCount === 0,
      recommendation:
        userCount === 0
          ? "Run POST /api/seed to populate database"
          : "Database is populated",
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
