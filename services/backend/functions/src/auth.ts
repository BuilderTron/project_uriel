import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Request, Response} from "firebase-functions";

const db = admin.firestore();

/**
 * Authentication middleware for validating Firebase ID tokens
 */
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * Middleware to validate Firebase ID token
 */
export const validateAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: () => void
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid authorization header"
      });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth validation error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token"
    });
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: () => void
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required"
    });
    return;
  }

  // Check for admin role in custom claims
  if (req.user.role !== "admin") {
    res.status(403).json({
      error: "Forbidden",
      message: "Admin role required"
    });
    return;
  }

  next();
};

/**
 * Custom claims management for role assignment
 */
export const setUserRole = async (uid: string, role: "admin" | "user"): Promise<void> => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Role '${role}' assigned to user ${uid}`);
  } catch (error) {
    console.error("Error setting user role:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to assign user role"
    );
  }
};

/**
 * Create or update user profile on first login
 */
export const createUserProfile = async (user: admin.auth.DecodedIdToken): Promise<void> => {
  try {
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user profile
      const userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.name || user.email?.split("@")[0] || "Anonymous",
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
        }
      };

      await userRef.set(userData);
      console.log(`User profile created for ${user.uid}`);
    } else {
      // Update last login timestamp
      await userRef.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid
      });
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create user profile"
    );
  }
};

/**
 * Admin function to create user with role
 */
export const createUserWithRole = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  // Verify admin role
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin role required"
    );
  }

  try {
    const { email, password, displayName, role = "user" } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and password are required"
      );
    }

    // Create user account
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
      emailVerified: false
    });

    // Set custom claims
    await setUserRole(userRecord.uid, role);

    // Create user profile in Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email || "",
      displayName: userRecord.displayName || "",
      role,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      updatedBy: context.auth.uid,
      preferences: {
        theme: "light",
        emailNotifications: true,
        language: "en"
      }
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    return {
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      role
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create user"
    );
  }
});

/**
 * Admin function to update user role
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  // Verify admin role
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin role required"
    );
  }

  try {
    const { uid, role } = data;

    if (!uid || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID and role are required"
      );
    }

    if (role !== "admin" && role !== "user") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Role must be 'admin' or 'user'"
      );
    }

    // Update custom claims
    await setUserRole(uid, role);

    // Update Firestore user document
    await db.collection("users").doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    });

    return {
      success: true,
      uid,
      role
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update user role"
    );
  }
});

/**
 * Function to handle user profile creation on first login
 */
export const onUserLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    await createUserProfile(context.auth.token);

    return {
      success: true,
      message: "User profile created/updated successfully"
    };
  } catch (error) {
    console.error("Error handling user login:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to handle user login"
    );
  }
});

/**
 * Session management: logout function
 */
export const logout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    // Revoke refresh tokens to invalidate all sessions
    await admin.auth().revokeRefreshTokens(context.auth.uid);

    // Update user profile with logout timestamp
    await db.collection("users").doc(context.auth.uid).update({
      lastLogout: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    });

    return {
      success: true,
      message: "Logged out successfully"
    };
  } catch (error) {
    console.error("Error during logout:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to logout"
    );
  }
});

/**
 * Get current user profile
 */
export const getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const userDoc = await db.collection("users").doc(context.auth.uid).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User profile not found"
      );
    }

    const userData = userDoc.data();
    
    // Remove sensitive fields before returning
    delete userData?.createdBy;
    delete userData?.updatedBy;

    return {
      success: true,
      profile: userData
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get user profile"
    );
  }
});