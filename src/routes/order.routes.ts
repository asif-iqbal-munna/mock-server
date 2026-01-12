import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticateToken, authorizeRole } from "../middleware";

const router = Router();

router.post("/", authenticateToken, createOrder);
router.get("/", authenticateToken, getUserOrders);
router.get("/:id", authenticateToken, getOrderById);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole("admin"),
  updateOrderStatus
);

export default router;
