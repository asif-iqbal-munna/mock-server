"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    stock: Number,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});
exports.Product = (0, mongoose_1.model)('Product', productSchema);
