/**
 * Contact message data model interfaces for Project Uriel
 * 
 * Defines contact form submissions, validation, and management.
 */

import { BaseDocument, Priority, TimestampFields } from "./index";

/**
 * Contact message data
 */
export interface ContactMessage extends BaseDocument {
  /** Sender's name */
  name: string;
  
  /** Sender's email address */
  email: string;
  
  /** Subject line */
  subject: string;
  
  /** Message content */
  message: string;
  
  /** Message status */
  status: ContactMessageStatus;
  
  /** Message priority */
  priority: Priority;
  
  /** Whether message has been read */
  read: boolean;
  
  /** Admin response */
  response?: string;
  
  /** Response timestamp */
  respondedAt?: FirebaseFirestore.Timestamp;
  
  /** Admin who responded */
  respondedBy?: string;
  
  /** Admin notes (internal) */
  adminNotes?: string;
  
  /** Sender's IP address (for spam prevention) */
  ipAddress?: string;
  
  /** User agent (for analytics) */
  userAgent?: string;
  
  /** Referrer URL */
  referrer?: string;
  
  /** Form source/page */
  source?: string;
  
  /** Spam score (0-100) */
  spamScore?: number;
  
  /** Whether message is marked as spam */
  isSpam: boolean;
  
  /** Follow-up required flag */
  requiresFollowUp: boolean;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Attachment URLs */
  attachments?: ContactAttachment[];
}

/**
 * Contact message status types
 */
export type ContactMessageStatus = 
  | "new"
  | "read"
  | "in-progress"
  | "responded"
  | "closed"
  | "spam"
  | "archived";

/**
 * Contact form attachment
 */
export interface ContactAttachment {
  /** File name */
  filename: string;
  
  /** File URL in Firebase Storage */
  url: string;
  
  /** MIME type */
  mimeType: string;
  
  /** File size in bytes */
  size: number;
  
  /** Upload timestamp */
  uploadedAt: FirebaseFirestore.Timestamp;
}

/**
 * Contact form submission request
 */
export interface CreateContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  source?: string;
  attachments?: File[];
  /** Google reCAPTCHA token */
  recaptchaToken?: string;
}

/**
 * Contact message update request (admin only)
 */
export interface UpdateContactMessageRequest {
  status?: ContactMessageStatus;
  priority?: Priority;
  read?: boolean;
  response?: string;
  adminNotes?: string;
  isSpam?: boolean;
  requiresFollowUp?: boolean;
  tags?: string[];
}

/**
 * Contact message response request
 */
export interface RespondToContactMessageRequest {
  /** Response message content */
  response: string;
  
  /** Auto-close after response */
  autoClose?: boolean;
  
  /** CC other recipients */
  ccEmails?: string[];
  
  /** Email template to use */
  template?: string;
}

/**
 * Public contact message (safe for client display)
 */
export interface PublicContactMessage {
  id: string;
  name: string;
  subject: string;
  status: ContactMessageStatus;
  priority: Priority;
  createdAt: FirebaseFirestore.Timestamp;
  respondedAt?: FirebaseFirestore.Timestamp;
  // Note: Email, message content, and admin data excluded for privacy
}

/**
 * Contact message filters for admin queries
 */
export interface ContactMessageFilters {
  status?: ContactMessageStatus | ContactMessageStatus[];
  priority?: Priority | Priority[];
  read?: boolean;
  isSpam?: boolean;
  requiresFollowUp?: boolean;
  tags?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  search?: string; // Search in name, email, subject, message
}

/**
 * Contact message sort options
 */
export type ContactMessageSortBy = 
  | "createdAt"
  | "priority"
  | "status"
  | "name"
  | "subject"
  | "respondedAt";

export interface ContactMessageQueryOptions {
  filters?: ContactMessageFilters;
  sortBy?: ContactMessageSortBy;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Contact form statistics
 */
export interface ContactFormStats extends TimestampFields {
  /** Total messages received */
  totalMessages: number;
  
  /** Messages this month */
  messagesThisMonth: number;
  
  /** Average response time in hours */
  avgResponseTime: number;
  
  /** Response rate percentage */
  responseRate: number;
  
  /** Spam detection rate */
  spamRate: number;
  
  /** Most common subjects */
  commonSubjects: Array<{
    subject: string;
    count: number;
  }>;
  
  /** Monthly breakdown */
  monthlyStats: Array<{
    month: string; // YYYY-MM
    messages: number;
    responses: number;
    avgResponseTime: number;
  }>;
}

/**
 * Email template for responses
 */
export interface EmailTemplate extends BaseDocument {
  /** Template name */
  name: string;
  
  /** Template subject */
  subject: string;
  
  /** Template body (supports variables) */
  body: string;
  
  /** Template variables */
  variables?: string[];
  
  /** Whether template is active */
  active: boolean;
  
  /** Template category */
  category: string;
  
  /** Usage count */
  usageCount: number;
  
  /** Last used timestamp */
  lastUsedAt?: FirebaseFirestore.Timestamp;
}

/**
 * Auto-response settings
 */
export interface AutoResponseSettings {
  /** Whether auto-response is enabled */
  enabled: boolean;
  
  /** Auto-response template ID */
  templateId?: string;
  
  /** Auto-response delay in minutes */
  delayMinutes: number;
  
  /** Business hours only */
  businessHoursOnly: boolean;
  
  /** Business hours definition */
  businessHours?: {
    timezone: string;
    schedule: Array<{
      day: number; // 0-6 (Sunday-Saturday)
      start: string; // HH:mm
      end: string; // HH:mm
    }>;
  };
}

/**
 * Contact form validation rules
 */
export interface ContactFormValidation {
  /** Maximum message length */
  maxMessageLength: number;
  
  /** Required fields */
  requiredFields: Array<"name" | "email" | "subject" | "message">;
  
  /** Email domain blocklist */
  blockedDomains: string[];
  
  /** Spam keyword detection */
  spamKeywords: string[];
  
  /** Rate limiting rules */
  rateLimiting: {
    /** Max submissions per IP per hour */
    maxPerHour: number;
    
    /** Max submissions per email per day */
    maxPerEmailPerDay: number;
  };
  
  /** File upload settings */
  fileUpload: {
    /** Whether file uploads are allowed */
    enabled: boolean;
    
    /** Maximum file size in MB */
    maxSizeMB: number;
    
    /** Allowed file types */
    allowedTypes: string[];
    
    /** Maximum number of files */
    maxFiles: number;
  };
}