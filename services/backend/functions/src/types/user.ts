/**
 * User data model interfaces for Project Uriel
 * 
 * Defines user profiles, authentication data, and role-based access control.
 */

import { BaseDocument, UserRole, TimestampFields } from "./index";

/**
 * Core user profile data stored in Firestore
 */
export interface User extends BaseDocument {
  /** Firebase Authentication UID */
  uid: string;
  
  /** User's email address */
  email: string;
  
  /** Display name for the user */
  displayName: string;
  
  /** User's role for RBAC */
  role: UserRole;
  
  /** Optional profile photo URL */
  photoURL?: string;
  
  /** Whether the user's email is verified */
  emailVerified: boolean;
  
  /** User preferences and settings */
  preferences?: UserPreferences;
  
  /** Last login timestamp */
  lastLoginAt?: FirebaseFirestore.Timestamp;
  
  /** Whether the user account is active */
  isActive: boolean;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  /** Preferred theme (light/dark) */
  theme?: "light" | "dark";
  
  /** Email notification preferences */
  notifications?: NotificationPreferences;
  
  /** Language preference */
  language?: string;
  
  /** Timezone preference */
  timezone?: string;
}

/**
 * Email notification preferences
 */
export interface NotificationPreferences {
  /** Receive contact form notifications */
  contactMessages: boolean;
  
  /** Receive blog comment notifications */
  blogComments: boolean;
  
  /** Receive system updates */
  systemUpdates: boolean;
  
  /** Marketing emails opt-in */
  marketing: boolean;
}

/**
 * User creation request data
 */
export interface CreateUserRequest {
  email: string;
  displayName: string;
  role?: UserRole;
  password?: string;
  emailVerified?: boolean;
}

/**
 * User update request data
 */
export interface UpdateUserRequest {
  displayName?: string;
  photoURL?: string;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
  // Note: role and email changes require admin privileges
}

/**
 * Admin-specific user data for management operations
 */
export interface AdminUserData extends User {
  /** Custom claims for Firebase Auth */
  customClaims?: Record<string, any>;
  
  /** User creation metadata */
  metadata?: {
    creationTime: string;
    lastSignInTime?: string;
    lastRefreshTime?: string;
  };
  
  /** Provider information */
  providerData?: Array<{
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    providerId: string;
  }>;
}

/**
 * Public user profile (safe for client-side display)
 */
export interface PublicUserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  /** Only show role if admin for security */
  role?: UserRole;
}

/**
 * User analytics data
 */
export interface UserAnalytics extends TimestampFields {
  userId: string;
  totalLogins: number;
  lastLoginAt: FirebaseFirestore.Timestamp;
  sessionsThisMonth: number;
  averageSessionDuration: number; // in minutes
}