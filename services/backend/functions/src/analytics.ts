import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface AnalyticsEvent {
  type: "page_view" | "project_view" | "blog_view" | "contact_submit" | "download";
  page?: string;
  projectId?: string;
  postId?: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
  timestamp: admin.firestore.FieldValue;
  sessionId?: string;
}

// Function to track analytics events
export const trackEvent = functions.https.onCall(async (data, context) => {
  try {
    const {type, page, projectId, postId, userAgent, referer, sessionId} = data;

    if (!type) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Event type is required"
      );
    }

    // Validate event type
    const validTypes = [
      "page_view",
      "project_view", 
      "blog_view",
      "contact_submit",
      "download"
    ];
    
    if (!validTypes.includes(type)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid event type"
      );
    }

    // Get client IP (if available)
    const clientIP = context.rawRequest?.ip || 
                    context.rawRequest?.connection?.remoteAddress;

    // Create analytics event
    const eventData: AnalyticsEvent = {
      type,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: userAgent?.substring(0, 500), // Limit length
      referer: referer?.substring(0, 500),
      ip: clientIP,
      sessionId,
    };

    // Add optional fields based on event type
    if (page) eventData.page = page;
    if (projectId) eventData.projectId = projectId;
    if (postId) eventData.postId = postId;

    // Save to Firestore
    await db.collection("analytics").add(eventData);

    // Update aggregated statistics
    await updateDailyStats(type, page, projectId, postId);

    return {success: true};
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "Failed to track event"
    );
  }
});

// Function to update daily aggregated statistics
async function updateDailyStats(
  type: string,
  page?: string,
  projectId?: string,
  postId?: string
) {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const statsDoc = db.collection("analytics").doc(`daily-${today}`);

    const increment = admin.firestore.FieldValue.increment(1);
    const updates: {[key: string]: admin.firestore.FieldValue} = {};

    // Update general counters
    updates[`events.${type}`] = increment;
    updates.totalEvents = increment;

    // Update page-specific counters
    if (page) {
      const safePage = page.replace(/[.#$/\[\]]/g, "_"); // Firestore safe key
      updates[`pages.${safePage}`] = increment;
    }

    // Update project-specific counters
    if (projectId) {
      updates[`projects.${projectId}`] = increment;
    }

    // Update blog post-specific counters
    if (postId) {
      updates[`posts.${postId}`] = increment;
    }

    await statsDoc.set(updates, {merge: true});
  } catch (error) {
    console.error("Error updating daily stats:", error);
    // Don't throw here - analytics tracking shouldn't break the main flow
  }
}

// Function to get analytics summary (admin only)
export const getAnalyticsSummary = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated and is admin
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to access analytics"
      );
    }

    // In a real app, you'd check custom claims for admin role
    // For now, just check if user exists
    try {
      const {days = 30} = data;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily stats for the specified period
      const dailyStatsQuery = db.collection("analytics")
        .where(admin.firestore.FieldPath.documentId(), ">=", 
               `daily-${startDate.toISOString().split("T")[0]}`)
        .where(admin.firestore.FieldPath.documentId(), "<=", 
               `daily-${endDate.toISOString().split("T")[0]}`)
        .orderBy(admin.firestore.FieldPath.documentId(), "desc");

      const dailyStatsSnapshot = await dailyStatsQuery.get();
      const dailyStats = dailyStatsSnapshot.docs.map((doc) => ({
        date: doc.id.replace("daily-", ""),
        ...doc.data(),
      }));

      return {
        success: true,
        period: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
          days,
        },
        dailyStats,
      };
    } catch (error) {
      console.error("Error getting analytics summary:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get analytics summary"
      );
    }
  }
);

export const analyticsFunction = {
  trackEvent,
  getAnalyticsSummary,
};