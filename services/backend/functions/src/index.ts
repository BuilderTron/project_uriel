import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import {contactForm} from "./contact";
import {blogFunctions} from "./blog";
import {analyticsFunction} from "./analytics";

// Import auth functions
import {
  createUserWithRole,
  updateUserRole,
  onUserLogin,
  logout,
  getUserProfile
} from "./auth";

// Import triggers
import {
  onUserCreated,
  onAuthUserCreated,
  onAuthUserDeleted,
  onContactMessageCreated,
  cleanupAnalytics,
  generateDailyStats
} from "./triggers";

// Import middleware
import {
  rateLimits,
  securityHeaders,
  corsOptions,
  errorHandler,
  requestLogger,
  healthCheck as healthCheckHandler
} from "./middleware";

// Export callable functions
export const contact = contactForm;
export const blog = blogFunctions;
export const analytics = analyticsFunction;

// Export auth functions
export const auth = {
  createUserWithRole,
  updateUserRole,
  onUserLogin,
  logout,
  getUserProfile
};

// Export triggers
export const triggers = {
  onUserCreated,
  onAuthUserCreated,
  onAuthUserDeleted,
  onContactMessageCreated,
  cleanupAnalytics,
  generateDailyStats
};

// Create Express app for HTTP endpoints
const app = express();

// Apply security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// Apply rate limiting
app.use("/auth", rateLimits.auth);
app.use("/contact", rateLimits.contact);
app.use("/admin", rateLimits.admin);
app.use(rateLimits.general);

// Health check endpoint
app.get("/health", healthCheckHandler);
app.get("/healthz", healthCheckHandler);

// API versioning
const v1 = express.Router();

// Public endpoints
v1.get("/status", (req, res) => {
  res.json({
    status: "online",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Protected admin routes would go here
// Example: v1.use("/admin", validateAuth, requireAdmin);

app.use("/v1", v1);

// Error handling
app.use(errorHandler);

// Export HTTP functions
export const api = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB"
  })
  .https.onRequest(app);

// Health check function (legacy)
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "project-uriel-functions",
  });
});