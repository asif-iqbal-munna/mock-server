import express, { Application } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middleware";
import { connectDatabase } from "./config/db";
import dayjs from "dayjs";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Request Logging Middleware (Development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(
      `${req.method} ${req.path} - ${dayjs(new Date()).format("DD MMM YYYY HH:mm:ss")}`
    );
    next();
  });
}

// ==================== ROUTES ====================

// Health Check
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});
console.log({ routes });
// API Routes
app.use("/api", routes);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    message: "The requested endpoint does not exist",
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// ==================== START SERVER ====================

const startServer = async (): Promise<void> => {
  try {
    // Connect to Database
    await connectDatabase();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful Shutdown
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM signal received: closing HTTP server");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("\n⚠️  SIGINT signal received: closing HTTP server");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
