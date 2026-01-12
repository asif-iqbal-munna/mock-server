import { Router } from "express";
import { submitForm } from "../controllers/form.controller";
import { authenticateToken, idempotencyCheck } from "../middleware";

const router = Router();

router.post("/submit", authenticateToken, idempotencyCheck, submitForm);

export default router;
