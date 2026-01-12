import { Router } from "express";
import {
  seedDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../controllers/seed.controller";

const router = Router();

router.post("/", seedDatabase);
router.delete("/", clearDatabase);
router.get("/stats", getDatabaseStats);

export default router;
