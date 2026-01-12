"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitForm = void 0;
const models_1 = require("../models");
const submitForm = async (req, res) => {
    try {
        const submission = new models_1.FormSubmission({
            userId: req.user?.id,
            formData: req.body.formData,
            submissionHash: req.idempotencyKey,
        });
        await submission.save();
        res.status(201).json({
            message: "Form submitted successfully",
            data: submission,
            duplicate: false,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.submitForm = submitForm;
