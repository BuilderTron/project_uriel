import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import {contactForm} from "./contact";
import {blogFunctions} from "./blog";
import {analyticsFunction} from "./analytics";

// Export all functions
export const contact = contactForm;
export const blog = blogFunctions;
export const analytics = analyticsFunction;

// Health check function
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "project-uriel-functions",
  });
});