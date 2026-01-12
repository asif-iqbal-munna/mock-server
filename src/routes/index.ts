// src/routes/index.ts
import { Router } from "express";
import authRouts from "./auth.routes";
import formRoutes from "./form.routes";
import productRoutes from "./product.routes";
import orderRoutes from "./order.routes";
import blogRoutes from "./blog.routes";
import seedRoutes from "./seed.routes";

const router = Router();

router.use("/auth", authRouts);
router.use("/forms", formRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/blog", blogRoutes);
router.use("/seed", seedRoutes);

export default router;
