"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormSubmission = void 0;
const mongoose_1 = require("mongoose");
const formSubmissionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    formData: { type: mongoose_1.Schema.Types.Mixed, required: true },
    submissionHash: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});
exports.FormSubmission = (0, mongoose_1.model)('FormSubmission', formSubmissionSchema);
