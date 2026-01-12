"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseStats = exports.clearDatabase = exports.seedDatabase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models");
const seedDatabase = async (_req, res) => {
    try {
        console.log("🌱 Starting database seeding...");
        await Promise.all([
            models_1.User.deleteMany({}),
            models_1.Product.deleteMany({}),
            models_1.BlogPost.deleteMany({}),
            models_1.Order.deleteMany({}),
            models_1.FormSubmission.deleteMany({}),
        ]);
        console.log("✅ Cleared existing data");
        const adminPassword = await bcryptjs_1.default.hash("admin123", 10);
        const userPassword = await bcryptjs_1.default.hash("user123", 10);
        const admin = await models_1.User.create({
            email: "admin@example.com",
            password: adminPassword,
            role: "admin",
        });
        const regularUser = await models_1.User.create({
            email: "user@example.com",
            password: userPassword,
            role: "user",
        });
        const testUsers = await models_1.User.create([
            {
                email: "alice@example.com",
                password: userPassword,
                role: "user",
            },
            {
                email: "bob@example.com",
                password: userPassword,
                role: "user",
            },
            {
                email: "charlie@example.com",
                password: userPassword,
                role: "admin",
            },
        ]);
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
        const products = [];
        let productCounter = 1;
        for (let i = 0; i < 200; i++) {
            const category = categories[i % categories.length];
            const categoryProducts = productNames[category] ||
                productNames.Electronics;
            const baseName = categoryProducts[i % categoryProducts.length];
            products.push({
                name: `${baseName} ${productCounter}`,
                description: `High-quality ${baseName.toLowerCase()} with premium features. Perfect for ${category.toLowerCase()} enthusiasts. Model #${productCounter}`,
                price: Math.floor(Math.random() * 2000) + 10,
                category,
                stock: Math.floor(Math.random() * 150),
                imageUrl: `https://picsum.photos/seed/${productCounter}/400/300`,
            });
            productCounter++;
        }
        const createdProducts = await models_1.Product.insertMany(products);
        console.log("✅ Created 200 products (Scenario 2: Search & Performance)");
        await models_1.Product.create([
            {
                name: "Mystery Product (No Image)",
                description: "This product has no image URL",
                price: 99.99,
                category: "Electronics",
                stock: 10,
            },
            {
                name: "Minimal Product (No Description)",
                price: 49.99,
                category: "Books",
                stock: 5,
                imageUrl: "https://picsum.photos/seed/minimal/400/300",
            },
            {
                name: "Out of Stock Item",
                description: "This item is currently unavailable",
                price: 199.99,
                category: "Clothing",
            },
        ]);
        console.log("✅ Added products with missing fields (Scenario 3: Inconsistent Data)");
        const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        const orders = [];
        for (let i = 0; i < 30; i++) {
            const randomProducts = createdProducts
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3) + 1);
            const items = randomProducts.map((p) => ({
                productId: p._id.toString(),
                quantity: Math.floor(Math.random() * 3) + 1,
                price: p.price,
            }));
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            orders.push({
                userId: i % 2 === 0 ? regularUser._id : testUsers[0]._id,
                items,
                status: orderStatuses[i % orderStatuses.length],
                total,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            });
        }
        await models_1.Order.insertMany(orders);
        console.log("✅ Created 30 orders with various statuses (Scenario 6: Real-time Updates)");
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
                published: i < 12,
                publishedAt: i < 12
                    ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
                    : undefined,
            };
        });
        await models_1.BlogPost.insertMany(blogPosts);
        console.log("✅ Created 15 blog posts (Scenario 9: SEO)");
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
        await models_1.FormSubmission.insertMany(formSubmissions);
        console.log("✅ Created sample form submissions (Scenario 1: Duplicate Prevention)");
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
                additionalUsers: [
                    { email: "alice@example.com", password: "user123", role: "user" },
                    { email: "bob@example.com", password: "user123", role: "user" },
                    { email: "charlie@example.com", password: "admin123", role: "admin" },
                ],
            },
            statistics: {
                users: 5,
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
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        res.status(500).json({
            error: "Seeding failed",
            message: error.message,
        });
    }
};
exports.seedDatabase = seedDatabase;
const clearDatabase = async (_req, res) => {
    try {
        await Promise.all([
            models_1.User.deleteMany({}),
            models_1.Product.deleteMany({}),
            models_1.BlogPost.deleteMany({}),
            models_1.Order.deleteMany({}),
            models_1.FormSubmission.deleteMany({}),
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.clearDatabase = clearDatabase;
const getDatabaseStats = async (_req, res) => {
    try {
        const [userCount, productCount, orderCount, blogPostCount, formSubmissionCount,] = await Promise.all([
            models_1.User.countDocuments(),
            models_1.Product.countDocuments(),
            models_1.Order.countDocuments(),
            models_1.BlogPost.countDocuments(),
            models_1.FormSubmission.countDocuments(),
        ]);
        res.json({
            statistics: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                blogPosts: blogPostCount,
                formSubmissions: formSubmissionCount,
                total: userCount +
                    productCount +
                    orderCount +
                    blogPostCount +
                    formSubmissionCount,
            },
            isEmpty: userCount === 0 && productCount === 0,
            recommendation: userCount === 0
                ? "Run POST /api/seed to populate database"
                : "Database is populated",
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDatabaseStats = getDatabaseStats;
