import { Router } from "express";
import { getAllPosts, getPostBySlug } from "../controllers/blog.controller";
// import { authenticateToken, authorizeRole } from "../middleware";

const router = Router();

router.get("/posts", getAllPosts);
router.get("/posts/:slug", getPostBySlug);
// router.post("/posts", authenticateToken, authorizeRole("admin"), createPost);

export default router;
