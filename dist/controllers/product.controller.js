"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = exports.getProductById = exports.searchProducts = void 0;
const models_1 = require("../models");
const searchProducts = async (req, res) => {
    try {
        const { q = "", page = "1", limit = "20", category, minPrice, maxPrice, } = req.query;
        const query = {};
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }
        if (category)
            query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            models_1.Product.find(query).skip(skip).limit(Number(limit)).lean(),
            models_1.Product.countDocuments(query),
        ]);
        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.searchProducts = searchProducts;
const getProductById = async (req, res) => {
    try {
        const product = await models_1.Product.findById(req.params.id).lean();
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const shouldSimulateInconsistency = Math.random() > 0.7;
        if (shouldSimulateInconsistency) {
            delete product.imageUrl;
            delete product.description;
        }
        res.json({
            ...product,
            imageUrl: product.imageUrl || null,
            description: product.description || null,
            stock: product.stock ?? 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const product = new models_1.Product(req.body);
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
