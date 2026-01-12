"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);
if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
    });
}
app.get("/health", (_req, res) => {
    res.json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
console.log({ routes: routes_1.default });
app.use("/api", routes_1.default);
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        message: "The requested endpoint does not exist",
    });
});
app.use(middleware_1.errorHandler);
const startServer = async () => {
    try {
        await (0, db_1.connectDatabase)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        process.on("SIGTERM", () => {
            console.log("⚠️  SIGTERM signal received: closing HTTP server");
            process.exit(0);
        });
        process.on("SIGINT", () => {
            console.log("\n⚠️  SIGINT signal received: closing HTTP server");
            process.exit(0);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
