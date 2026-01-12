"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const form_controller_1 = require("../controllers/form.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post("/submit", middleware_1.authenticateToken, middleware_1.idempotencyCheck, form_controller_1.submitForm);
exports.default = router;
