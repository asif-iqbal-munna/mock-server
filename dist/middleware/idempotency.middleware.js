"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyCheck = void 0;
const models_1 = require("../models");
const idempotencyCheck = async (req, res, next) => {
    const idempotencyKey = req.headers["idempotency-key"];
    if (!idempotencyKey) {
        res.status(400).json({ error: "Idempotency-Key header required" });
        return;
    }
    try {
        const existing = await models_1.FormSubmission.findOne({
            submissionHash: idempotencyKey,
        });
        if (existing) {
            res.status(200).json({
                message: "Duplicate submission prevented",
                data: existing,
                duplicate: true,
            });
            return;
        }
        req.idempotencyKey = idempotencyKey;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.idempotencyCheck = idempotencyCheck;
