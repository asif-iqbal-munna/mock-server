"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostBySlug = exports.getAllPosts = void 0;
const models_1 = require("../models");
const getAllPosts = async (req, res) => {
    try {
        const { page = "1", limit = "10" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [posts, total] = await Promise.all([
            models_1.BlogPost.find({ published: true })
                .select("title slug excerpt author tags publishedAt")
                .populate("author", "email")
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            models_1.BlogPost.countDocuments({ published: true }),
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllPosts = getAllPosts;
const getPostBySlug = async (req, res) => {
    try {
        const post = await models_1.BlogPost.findOne({
            slug: req.params.slug,
            published: true,
        })
            .populate("author", "email")
            .lean();
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPostBySlug = getPostBySlug;
