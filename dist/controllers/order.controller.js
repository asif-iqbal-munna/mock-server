"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const models_1 = require("../models");
const createOrder = async (req, res) => {
    try {
        const order = new models_1.Order({
            userId: req.user?.id,
            items: req.body.items,
            total: req.body.total,
        });
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createOrder = createOrder;
const getUserOrders = async (req, res) => {
    try {
        const orders = await models_1.Order.find({ userId: req.user?.id }).sort({
            createdAt: -1,
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserOrders = getUserOrders;
const getOrderById = async (req, res) => {
    try {
        const order = await models_1.Order.findOne({
            _id: req.params.id,
            userId: req.user?.id,
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await models_1.Order.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
