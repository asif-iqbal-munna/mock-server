"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_controller_1 = require("../controllers/seed.controller");
const router = (0, express_1.Router)();
router.post("/", seed_controller_1.seedDatabase);
router.delete("/", seed_controller_1.clearDatabase);
router.get("/stats", seed_controller_1.getDatabaseStats);
exports.default = router;
