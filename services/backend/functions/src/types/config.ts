/**
 * Site configuration data model interfaces for Project Uriel
 * 
 * Defines global site settings, feature flags, and configuration management.
 */

import { TimestampFields } from "./index";

/**
 * Site configuration data
 */
export interface SiteConfig extends TimestampFields {
  /** Configuration section */
  section: ConfigSection;
  
  /** Configuration key */
  key: string;
  
  /** Configuration value */
  value: any;
  
  /** Value type */
  type: ConfigValueType;
  
  /** Configuration description */
  description?: string;
  
  /** Whether config is public (client-accessible) */
  public: boolean;
  
  /** Whether config is active */
  active: boolean;
  
  /** Environment where config applies */
  environment?: ConfigEnvironment;
  
  /** Last modified by */
  modifiedBy?: string;
  
  /** Configuration version */
  version: number;
}

/**
 * Configuration sections
 */
export type ConfigSection = 
  | "site"
  | "features"
  | "api"
  | "social"
  | "contact"
  | "analytics"
  | "security"
  | "email"
  | "storage"
  | "seo"
  | "performance"
  | "maintenance";

/**
 * Configuration value types
 */
export type ConfigValueType = 
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "url"
  | "email"
  | "json";

/**
 * Configuration environments
 */
export type ConfigEnvironment = 
  | "development"
  | "staging"
  | "production"
  | "all";

/**
 * Site settings configuration
 */
export interface SiteSettings {
  /** Site title */
  title: string;
  
  /** Site description */
  description: string;
  
  /** Site URL */
  url: string;
  
  /** Site logo URL */
  logoUrl?: string;
  
  /** Favicon URL */
  faviconUrl?: string;
  
  /** Default language */
  defaultLanguage: string;
  
  /** Supported languages */
  supportedLanguages: string[];
  
  /** Default timezone */
  timezone: string;
  
  /** Copyright text */
  copyright: string;
  
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
  
  /** Terms of service URL */
  termsOfServiceUrl?: string;
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  /** Blog system enabled */
  blogEnabled: boolean;
  
  /** Contact form enabled */
  contactFormEnabled: boolean;
  
  /** Analytics tracking enabled */
  analyticsEnabled: boolean;
  
  /** Dark mode support */
  darkModeEnabled: boolean;
  
  /** Search functionality */
  searchEnabled: boolean;
  
  /** Comments on blog posts */
  commentsEnabled: boolean;
  
  /** Newsletter signup */
  newsletterEnabled: boolean;
  
  /** Social sharing */
  socialSharingEnabled: boolean;
  
  /** Progressive Web App features */
  pwaEnabled: boolean;
  
  /** Maintenance mode */
  maintenanceMode: boolean;
  
  /** User registration */
  userRegistrationEnabled: boolean;
  
  /** File uploads */
  fileUploadsEnabled: boolean;
}

/**
 * API configuration
 */
export interface ApiConfig {
  /** API base URL */
  baseUrl: string;
  
  /** API version */
  version: string;
  
  /** Rate limiting settings */
  rateLimiting: {
    /** Requests per minute */
    requestsPerMinute: number;
    
    /** Burst limit */
    burstLimit: number;
    
    /** Window size in seconds */
    windowSize: number;
  };
  
  /** CORS settings */
  cors: {
    /** Allowed origins */
    allowedOrigins: string[];
    
    /** Allowed methods */
    allowedMethods: string[];
    
    /** Allowed headers */
    allowedHeaders: string[];
    
    /** Max age for preflight requests */
    maxAge: number;
  };
  
  /** Authentication settings */
  authentication: {
    /** JWT expiration time */
    jwtExpirationTime: string;
    
    /** Refresh token expiration */
    refreshTokenExpiration: string;
    
    /** Max login attempts */
    maxLoginAttempts: number;
    
    /** Lockout duration */
    lockoutDuration: number;
  };
}

/**
 * Social media configuration
 */
export interface SocialConfig {
  /** Social media platforms */
  platforms: {
    /** Twitter/X */
    twitter?: {
      username: string;
      url: string;
      enabled: boolean;
    };
    
    /** LinkedIn */
    linkedin?: {
      username: string;
      url: string;
      enabled: boolean;
    };
    
    /** GitHub */
    github?: {
      username: string;
      url: string;
      enabled: boolean;
    };
    
    /** Instagram */
    instagram?: {
      username: string;
      url: string;
      enabled: boolean;
    };
    
    /** YouTube */
    youtube?: {
      channelId: string;
      url: string;
      enabled: boolean;
    };
    
    /** Discord */
    discord?: {
      serverId: string;
      inviteUrl: string;
      enabled: boolean;
    };
  };
  
  /** Open Graph defaults */
  openGraph: {
    /** Default OG image */
    defaultImage: string;
    
    /** Site name */
    siteName: string;
    
    /** Twitter card type */
    twitterCardType: "summary" | "summary_large_image";
  };
}

/**
 * Contact configuration
 */
export interface ContactConfig {
  /** Contact email */
  email: string;
  
  /** Contact phone */
  phone?: string;
  
  /** Physical address */
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  
  /** Contact form settings */
  form: {
    /** SendGrid template ID */
    emailTemplateId?: string;
    
    /** Auto-response enabled */
    autoResponseEnabled: boolean;
    
    /** Admin notification emails */
    notificationEmails: string[];
    
    /** reCAPTCHA enabled */
    recaptchaEnabled: boolean;
    
    /** Maximum message length */
    maxMessageLength: number;
    
    /** File uploads allowed */
    fileUploadsAllowed: boolean;
  };
  
  /** Business hours */
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: Array<{
      day: number; // 0-6 (Sunday-Saturday)
      open: string; // HH:mm
      close: string; // HH:mm
    }>;
  };
}

/**
 * SEO configuration
 */
export interface SEOConfig {
  /** Default meta tags */
  defaultMeta: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    robots: string;
  };
  
  /** Structured data */
  structuredData: {
    /** Organization data */
    organization: {
      name: string;
      url: string;
      logo: string;
      sameAs: string[];
    };
    
    /** Person data */
    person: {
      name: string;
      jobTitle: string;
      url: string;
      image: string;
      sameAs: string[];
    };
  };
  
  /** Sitemap settings */
  sitemap: {
    /** Auto-generate sitemap */
    autoGenerate: boolean;
    
    /** Update frequency */
    updateFrequency: "daily" | "weekly" | "monthly";
    
    /** Priority values */
    priorities: {
      homepage: number;
      about: number;
      projects: number;
      blog: number;
      contact: number;
    };
  };
  
  /** Analytics integration */
  analytics: {
    /** Google Analytics tracking ID */
    googleAnalyticsId?: string;
    
    /** Google Tag Manager ID */
    googleTagManagerId?: string;
    
    /** Plausible Analytics domain */
    plausibleDomain?: string;
  };
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Caching settings */
  caching: {
    /** Static asset cache duration */
    staticAssetCache: number;
    
    /** API response cache duration */
    apiResponseCache: number;
    
    /** Image cache duration */
    imageCache: number;
  };
  
  /** Image optimization */
  images: {
    /** Enable next-gen formats */
    nextGenFormats: boolean;
    
    /** Lazy loading enabled */
    lazyLoadingEnabled: boolean;
    
    /** Placeholder strategy */
    placeholderStrategy: "blur" | "solid" | "svg";
    
    /** Quality settings */
    quality: {
      default: number;
      thumbnail: number;
      hero: number;
    };
  };
  
  /** Bundle optimization */
  bundling: {
    /** Tree shaking enabled */
    treeShakingEnabled: boolean;
    
    /** Code splitting enabled */
    codeSplittingEnabled: boolean;
    
    /** Minification enabled */
    minificationEnabled: boolean;
  };
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  /** Content Security Policy */
  csp: {
    /** CSP header value */
    headerValue: string;
    
    /** Report violations */
    reportViolations: boolean;
    
    /** Report URI */
    reportUri?: string;
  };
  
  /** HTTPS settings */
  https: {
    /** Force HTTPS redirect */
    forceHttps: boolean;
    
    /** HSTS max age */
    hstsMaxAge: number;
    
    /** Include subdomains */
    includeSubdomains: boolean;
  };
  
  /** Input validation */
  validation: {
    /** Maximum request size */
    maxRequestSize: number;
    
    /** Upload file types */
    allowedFileTypes: string[];
    
    /** Maximum file size */
    maxFileSize: number;
  };
}

/**
 * Maintenance configuration
 */
export interface MaintenanceConfig {
  /** Maintenance mode enabled */
  enabled: boolean;
  
  /** Maintenance message */
  message: string;
  
  /** Estimated completion time */
  estimatedCompletion?: FirebaseFirestore.Timestamp;
  
  /** Allowed IP addresses */
  allowedIps: string[];
  
  /** Bypass key */
  bypassKey?: string;
  
  /** Custom maintenance page URL */
  customPageUrl?: string;
}

/**
 * Configuration update request
 */
export interface UpdateConfigRequest {
  section: ConfigSection;
  key: string;
  value: any;
  type: ConfigValueType;
  description?: string;
  public?: boolean;
  active?: boolean;
  environment?: ConfigEnvironment;
}

/**
 * Configuration export format
 */
export interface ConfigExport {
  /** Export timestamp */
  exportedAt: FirebaseFirestore.Timestamp;
  
  /** Environment */
  environment: ConfigEnvironment;
  
  /** Configuration data */
  configs: SiteConfig[];
  
  /** Export version */
  version: string;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;
  
  /** Validation errors */
  errors: ConfigValidationError[];
  
  /** Validation warnings */
  warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /** Configuration key */
  key: string;
  
  /** Error message */
  message: string;
  
  /** Error code */
  code: string;
  
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  /** Configuration key */
  key: string;
  
  /** Warning message */
  message: string;
  
  /** Warning level */
  level: "low" | "medium" | "high";
  
  /** Recommended action */
  recommendation?: string;
}