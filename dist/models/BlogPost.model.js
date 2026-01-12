"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPost = void 0;
const mongoose_1 = require("mongoose");
const blogPostSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    author: { type: String, required: true },
    metaTitle: String,
    metaDescription: String,
    tags: [String],
    published: { type: Boolean, default: false },
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now }
});
exports.BlogPost = (0, mongoose_1.model)('BlogPost', blogPostSchema);
