/**
 * Blog data model interfaces for Project Uriel
 * 
 * Defines blog posts, comments, categories, and content management.
 */

import { BaseDocument, DocumentStatus, TimestampFields } from "./index";

/**
 * Blog post data
 */
export interface BlogPost extends BaseDocument {
  /** Post title */
  title: string;
  
  /** URL-friendly slug */
  slug: string;
  
  /** Post content in Markdown */
  content: string;
  
  /** Short excerpt for previews */
  excerpt: string;
  
  /** Cover image URL */
  coverImage: string;
  
  /** Author information */
  author: BlogAuthor;
  
  /** Post status */
  status: DocumentStatus;
  
  /** Post tags */
  tags: string[];
  
  /** Post category */
  category: string;
  
  /** Reading time estimate in minutes */
  readingTime: number;
  
  /** View count */
  views: number;
  
  /** Like count */
  likes: number;
  
  /** Comment count */
  commentCount: number;
  
  /** Published timestamp */
  publishedAt?: FirebaseFirestore.Timestamp;
  
  /** Last modified timestamp */
  lastModifiedAt?: FirebaseFirestore.Timestamp;
  
  /** Featured post flag */
  featured: boolean;
  
  /** SEO metadata */
  seo?: BlogPostSEO;
  
  /** Related post IDs */
  relatedPosts?: string[];
  
  /** Post analytics */
  analytics?: BlogPostAnalytics;
}

/**
 * Blog author information
 */
export interface BlogAuthor {
  /** Author ID (matches user UID) */
  id: string;
  
  /** Author display name */
  name: string;
  
  /** Author bio */
  bio?: string;
  
  /** Author avatar URL */
  avatar?: string;
  
  /** Author social links */
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

/**
 * Blog post SEO metadata
 */
export interface BlogPostSEO {
  /** Meta title (overrides post title) */
  metaTitle?: string;
  
  /** Meta description */
  metaDescription?: string;
  
  /** Focus keywords */
  keywords?: string[];
  
  /** Open Graph image */
  ogImage?: string;
  
  /** Canonical URL */
  canonicalUrl?: string;
  
  /** Schema.org structured data */
  structuredData?: Record<string, any>;
}

/**
 * Blog post analytics
 */
export interface BlogPostAnalytics {
  /** Daily view breakdown */
  dailyViews?: DailyStats[];
  
  /** Referrer sources */
  referrers?: BlogReferrerStats[];
  
  /** Search keywords */
  searchKeywords?: string[];
  
  /** Average time on page */
  avgTimeOnPage?: number;
  
  /** Bounce rate */
  bounceRate?: number;
  
  /** Social shares */
  socialShares?: SocialShareStats;
}

/**
 * Daily statistics
 */
export interface DailyStats {
  date: string; // YYYY-MM-DD format
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
}

/**
 * Blog referrer statistics
 */
export interface BlogReferrerStats {
  source: string;
  views: number;
  percentage: number;
}

/**
 * Social share statistics
 */
export interface SocialShareStats {
  twitter: number;
  linkedin: number;
  facebook: number;
  reddit: number;
  total: number;
}

/**
 * Blog comment data
 */
export interface BlogComment extends BaseDocument {
  /** Parent post ID */
  postId: string;
  
  /** Comment content */
  content: string;
  
  /** Comment author */
  author: CommentAuthor;
  
  /** Parent comment ID (for replies) */
  parentId?: string;
  
  /** Comment status */
  status: CommentStatus;
  
  /** Like count */
  likes: number;
  
  /** Whether comment is approved */
  approved: boolean;
  
  /** Admin notes */
  adminNotes?: string;
  
  /** User IP address (for moderation) */
  ipAddress?: string;
  
  /** User agent (for moderation) */
  userAgent?: string;
}

/**
 * Comment author information
 */
export interface CommentAuthor {
  /** Author ID (if authenticated user) */
  id?: string;
  
  /** Author name */
  name: string;
  
  /** Author email */
  email: string;
  
  /** Author website */
  website?: string;
  
  /** Author avatar */
  avatar?: string;
}

/**
 * Comment status types
 */
export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

/**
 * Blog category data
 */
export interface BlogCategory extends TimestampFields {
  /** Category ID */
  id: string;
  
  /** Category name */
  name: string;
  
  /** Category slug */
  slug: string;
  
  /** Category description */
  description?: string;
  
  /** Category color (hex) */
  color?: string;
  
  /** Post count in category */
  postCount: number;
  
  /** Whether category is active */
  active: boolean;
}

/**
 * Blog post creation request
 */
export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImage: string;
  tags: string[];
  category: string;
  status?: DocumentStatus;
  featured?: boolean;
  seo?: BlogPostSEO;
  publishedAt?: Date | FirebaseFirestore.Timestamp;
}

/**
 * Blog post update request
 */
export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  category?: string;
  status?: DocumentStatus;
  featured?: boolean;
  seo?: BlogPostSEO;
  publishedAt?: Date | FirebaseFirestore.Timestamp;
}

/**
 * Public blog post (for client display)
 */
export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  category: string;
  readingTime: number;
  views: number;
  likes: number;
  commentCount: number;
  publishedAt: FirebaseFirestore.Timestamp;
  featured: boolean;
  relatedPosts?: string[];
  // Note: Analytics and internal data excluded
}

/**
 * Blog post filters for queries
 */
export interface BlogPostFilters {
  status?: DocumentStatus;
  category?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  publishedAfter?: Date;
  publishedBefore?: Date;
}

/**
 * Blog post sort options
 */
export type BlogPostSortBy = 
  | "publishedAt"
  | "createdAt"
  | "views"
  | "likes"
  | "commentCount"
  | "title";

export interface BlogPostQueryOptions {
  filters?: BlogPostFilters;
  sortBy?: BlogPostSortBy;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Comment creation request
 */
export interface CreateCommentRequest {
  postId: string;
  content: string;
  author: CommentAuthor;
  parentId?: string;
}

/**
 * Comment moderation request
 */
export interface ModerateCommentRequest {
  status: CommentStatus;
  adminNotes?: string;
}