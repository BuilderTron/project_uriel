import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {setUserRole} from "./auth";

const db = admin.firestore();

/**
 * Firestore trigger: User document creation
 * Automatically triggered when a new user document is created
 */
export const onUserCreated = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    try {
      const userData = snap.data();
      const userId = context.params.userId;
      
      console.log(`New user created: ${userId}`, userData);
      
      // Log user creation for analytics
      await db.collection("analytics").add({
        event: "user_created",
        userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          email: userData.email,
          role: userData.role
        }
      });
      
      // Send welcome notification (if email service is configured)
      if (process.env.SENDGRID_API_KEY && userData.email) {
        // This would integrate with email service
        console.log(`Welcome email should be sent to: ${userData.email}`);
      }
      
    } catch (error) {
      console.error("Error in onUserCreated trigger:", error);
    }
  });

/**
 * Auth trigger: User creation via Firebase Auth
 * Automatically creates user profile when a new Firebase Auth user is created
 */
export const onAuthUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`New Firebase Auth user created: ${user.uid}`);
    
    // Check if user document already exists
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create user profile
      const userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        role: "user", // Default role
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
        updatedBy: user.uid,
        preferences: {
          theme: "light",
          emailNotifications: true,
          language: "en"
        },
        metadata: {
          provider: user.providerData[0]?.providerId || "email",
          emailVerified: user.emailVerified,
          createdVia: "auth_trigger"
        }
      };
      
      await userRef.set(userData);
      
      // Set default custom claims
      await setUserRole(user.uid, "user");
      
      console.log(`User profile created for ${user.uid}`);
    }
    
  } catch (error) {
    console.error("Error in onAuthUserCreated trigger:", error);
  }
});

/**
 * Auth trigger: User deletion
 * Cleanup user data when Firebase Auth user is deleted
 */
export const onAuthUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    console.log(`Firebase Auth user deleted: ${user.uid}`);
    
    // Clean up user document
    await db.collection("users").doc(user.uid).delete();
    
    // Log deletion for analytics
    await db.collection("analytics").add({
      event: "user_deleted",
      userId: user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: user.email,
        deletedVia: "auth_trigger"
      }
    });
    
    console.log(`User data cleaned up for ${user.uid}`);
    
  } catch (error) {
    console.error("Error in onAuthUserDeleted trigger:", error);
  }
});

/**
 * Firestore trigger: Contact message creation
 * Automatically triggered when a new contact message is created
 */
export const onContactMessageCreated = functions.firestore
  .document("contact-messages/{messageId}")
  .onCreate(async (snap, context) => {
    try {
      const messageData = snap.data();
      const messageId = context.params.messageId;
      
      console.log(`New contact message: ${messageId}`, messageData);
      
      // Log for analytics
      await db.collection("analytics").add({
        event: "contact_message_received",
        messageId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          fromEmail: messageData.email,
          subject: messageData.subject,
          priority: messageData.priority || "normal"
        }
      });
      
      // Update contact message stats
      const statsRef = db.collection("config").doc("contact-stats");
      await statsRef.set({
        totalMessages: admin.firestore.FieldValue.increment(1),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
    } catch (error) {
      console.error("Error in onContactMessageCreated trigger:", error);
    }
  });

/**
 * Scheduled function: Cleanup old analytics data
 * Runs daily at 2 AM to clean up old analytics data
 */
export const cleanupAnalytics = functions.pubsub
  .schedule("0 2 * * *") // Daily at 2 AM
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("Starting analytics cleanup...");
      
      // Delete analytics data older than 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      const oldAnalytics = await db.collection("analytics")
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(cutoffDate))
        .limit(500) // Process in batches
        .get();
      
      if (!oldAnalytics.empty) {
        const batch = db.batch();
        oldAnalytics.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Deleted ${oldAnalytics.size} old analytics records`);
      }
      
      // Log cleanup operation
      await db.collection("analytics").add({
        event: "analytics_cleanup",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          deletedRecords: oldAnalytics.size,
          cutoffDate: cutoffDate.toISOString()
        }
      });
      
    } catch (error) {
      console.error("Error in cleanupAnalytics:", error);
    }
  });

/**
 * Scheduled function: Generate daily stats
 * Runs daily at 1 AM to generate daily statistics
 */
export const generateDailyStats = functions.pubsub
  .schedule("0 1 * * *") // Daily at 1 AM
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("Generating daily stats...");
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      
      // Count various events from yesterday
      const analytics = await db.collection("analytics")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(yesterday))
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(todayStart))
        .get();
      
      const stats = {
        date: yesterday.toISOString().split("T")[0],
        totalEvents: analytics.size,
        events: {} as any,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Group events by type
      analytics.docs.forEach(doc => {
        const data = doc.data();
        const eventType = data.event;
        stats.events[eventType] = (stats.events[eventType] || 0) + 1;
      });
      
      // Save daily stats
      await db.collection("daily-stats").doc(stats.date).set(stats);
      
      console.log(`Generated stats for ${stats.date}:`, stats);
      
    } catch (error) {
      console.error("Error in generateDailyStats:", error);
    }
  });