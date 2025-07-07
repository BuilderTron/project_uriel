/**
 * Project data model interfaces for Project Uriel portfolio
 * 
 * Defines project showcase data, technologies, and metadata.
 */

import { BaseDocument, DocumentStatus } from "./index";

/**
 * Portfolio project data
 */
export interface Project extends BaseDocument {
  /** Project title */
  title: string;
  
  /** Short description/tagline */
  description: string;
  
  /** Full project description in Markdown */
  fullDescription?: string;
  
  /** Array of technologies used */
  technologies: string[];
  
  /** Primary project image URL */
  imageUrl: string;
  
  /** Additional project images */
  gallery?: string[];
  
  /** GitHub repository URL */
  githubUrl?: string;
  
  /** Live demo URL */
  liveUrl?: string;
  
  /** Project category */
  category: ProjectCategory;
  
  /** Project status */
  status: DocumentStatus;
  
  /** Whether to feature on homepage */
  featured: boolean;
  
  /** Display order (lower = higher priority) */
  order: number;
  
  /** Project start date */
  startDate: FirebaseFirestore.Timestamp;
  
  /** Project completion date */
  completedAt?: FirebaseFirestore.Timestamp;
  
  /** Client or company name */
  client?: string;
  
  /** Project team members */
  team?: ProjectTeamMember[];
  
  /** View/click analytics */
  analytics?: ProjectAnalytics;
  
  /** SEO metadata */
  seo?: ProjectSEO;
}

/**
 * Project categories
 */
export type ProjectCategory = 
  | "web-development"
  | "mobile-app"
  | "desktop-app"
  | "api-backend"
  | "data-science"
  | "devops"
  | "ui-ux-design"
  | "other";

/**
 * Project team member information
 */
export interface ProjectTeamMember {
  name: string;
  role: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

/**
 * Project analytics data
 */
export interface ProjectAnalytics {
  /** Total views */
  views: number;
  
  /** GitHub link clicks */
  githubClicks: number;
  
  /** Live demo clicks */
  liveUrlClicks: number;
  
  /** Last view timestamp */
  lastViewAt?: FirebaseFirestore.Timestamp;
  
  /** Monthly view breakdown */
  monthlyViews?: MonthlyStats[];
}

/**
 * Monthly statistics
 */
export interface MonthlyStats {
  month: string; // YYYY-MM format
  views: number;
  clicks: number;
}

/**
 * Project SEO metadata
 */
export interface ProjectSEO {
  /** Meta title (overrides project title) */
  metaTitle?: string;
  
  /** Meta description */
  metaDescription?: string;
  
  /** Keywords for search */
  keywords?: string[];
  
  /** Open Graph image */
  ogImage?: string;
  
  /** Canonical URL */
  canonicalUrl?: string;
}

/**
 * Project creation request data
 */
export interface CreateProjectRequest {
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  imageUrl: string;
  gallery?: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: ProjectCategory;
  status?: DocumentStatus;
  featured?: boolean;
  order?: number;
  startDate: Date | FirebaseFirestore.Timestamp;
  completedAt?: Date | FirebaseFirestore.Timestamp;
  client?: string;
  team?: ProjectTeamMember[];
  seo?: ProjectSEO;
}

/**
 * Project update request data
 */
export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  fullDescription?: string;
  technologies?: string[];
  imageUrl?: string;
  gallery?: string[];
  githubUrl?: string;
  liveUrl?: string;
  category?: ProjectCategory;
  status?: DocumentStatus;
  featured?: boolean;
  order?: number;
  startDate?: Date | FirebaseFirestore.Timestamp;
  completedAt?: Date | FirebaseFirestore.Timestamp;
  client?: string;
  team?: ProjectTeamMember[];
  seo?: ProjectSEO;
}

/**
 * Public project data (for client-side display)
 */
export interface PublicProject {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  technologies: string[];
  imageUrl: string;
  gallery?: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  startDate: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  client?: string;
  team?: ProjectTeamMember[];
  createdAt: FirebaseFirestore.Timestamp;
  // Note: Analytics and internal data excluded from public interface
}

/**
 * Project filter options for queries
 */
export interface ProjectFilters {
  category?: ProjectCategory;
  technologies?: string[];
  featured?: boolean;
  status?: DocumentStatus;
  startDate?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Project sort options
 */
export type ProjectSortBy = 
  | "order"
  | "createdAt"
  | "completedAt"
  | "title"
  | "views";

export type SortDirection = "asc" | "desc";

export interface ProjectQueryOptions {
  filters?: ProjectFilters;
  sortBy?: ProjectSortBy;
  sortDirection?: SortDirection;
  limit?: number;
  offset?: number;
}