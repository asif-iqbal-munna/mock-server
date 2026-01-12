"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const router = (0, express_1.Router)();
router.get("/posts", blog_controller_1.getAllPosts);
router.get("/posts/:slug", blog_controller_1.getPostBySlug);
exports.default = router;
