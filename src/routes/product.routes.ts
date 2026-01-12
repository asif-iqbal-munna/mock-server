import { Router } from "express";
import {
  searchProducts,
  getProductById,
  createProduct,
} from "../controllers/product.controller";
import { authenticateToken, authorizeRole } from "../middleware";

const router = Router();

router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/", authenticateToken, authorizeRole("admin"), createProduct);

export default router;
