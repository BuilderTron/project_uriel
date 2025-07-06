/**
 * Analytics data model interfaces for Project Uriel
 * 
 * Defines analytics tracking, events, and reporting.
 */

import { TimestampFields } from './index';

/**
 * Analytics event data
 */
export interface AnalyticsEvent extends TimestampFields {
  /** Event ID */
  id: string;
  
  /** Event type */
  type: AnalyticsEventType;
  
  /** Event action */
  action: string;
  
  /** Event category */
  category: string;
  
  /** Event label */
  label?: string;
  
  /** Event value */
  value?: number;
  
  /** User ID (if authenticated) */
  userId?: string;
  
  /** Session ID */
  sessionId: string;
  
  /** Page/route where event occurred */
  page: string;
  
  /** Referrer URL */
  referrer?: string;
  
  /** User agent */
  userAgent?: string;
  
  /** IP address (hashed for privacy) */
  ipHash?: string;
  
  /** Geographic data */
  geo?: GeoLocation;
  
  /** Device information */
  device?: DeviceInfo;
  
  /** Custom properties */
  properties?: Record<string, any>;
  
  /** Event timestamp */
  timestamp: FirebaseFirestore.Timestamp;
}

/**
 * Analytics event types
 */
export type AnalyticsEventType = 
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'download'
  | 'external_link'
  | 'search'
  | 'video_play'
  | 'video_pause'
  | 'scroll'
  | 'time_on_page'
  | 'bounce'
  | 'conversion'
  | 'error'
  | 'custom';

/**
 * Geographic location data
 */
export interface GeoLocation {
  /** Country code (ISO 3166-1 alpha-2) */
  country?: string;
  
  /** Country name */
  countryName?: string;
  
  /** Region/state code */
  region?: string;
  
  /** Region/state name */
  regionName?: string;
  
  /** City name */
  city?: string;
  
  /** Postal/ZIP code */
  postalCode?: string;
  
  /** Timezone */
  timezone?: string;
  
  /** Latitude (rounded for privacy) */
  latitude?: number;
  
  /** Longitude (rounded for privacy) */
  longitude?: number;
}

/**
 * Device information
 */
export interface DeviceInfo {
  /** Device type */
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  
  /** Operating system */
  os?: string;
  
  /** OS version */
  osVersion?: string;
  
  /** Browser name */
  browser?: string;
  
  /** Browser version */
  browserVersion?: string;
  
  /** Screen resolution */
  screenResolution?: string;
  
  /** Viewport size */
  viewportSize?: string;
  
  /** Color depth */
  colorDepth?: number;
  
  /** Language */
  language?: string;
  
  /** Whether cookies are enabled */
  cookiesEnabled?: boolean;
}

/**
 * Page analytics summary
 */
export interface PageAnalytics extends TimestampFields {
  /** Page URL/route */
  page: string;
  
  /** Page title */
  title?: string;
  
  /** Total page views */
  views: number;
  
  /** Unique visitors */
  uniqueVisitors: number;
  
  /** Average time on page (seconds) */
  avgTimeOnPage: number;
  
  /** Bounce rate (percentage) */
  bounceRate: number;
  
  /** Entry rate (percentage) */
  entryRate: number;
  
  /** Exit rate (percentage) */
  exitRate: number;
  
  /** Conversion rate (percentage) */
  conversionRate?: number;
  
  /** Top referrers */
  topReferrers: ReferrerStats[];
  
  /** Device breakdown */
  deviceBreakdown: DeviceStats[];
  
  /** Geographic breakdown */
  geoBreakdown: GeoStats[];
  
  /** Daily stats for the period */
  dailyStats: DailyPageStats[];
}

/**
 * Referrer statistics
 */
export interface ReferrerStats {
  /** Referrer domain */
  referrer: string;
  
  /** Number of visits */
  visits: number;
  
  /** Percentage of total traffic */
  percentage: number;
}

/**
 * Device statistics
 */
export interface DeviceStats {
  /** Device type */
  deviceType: string;
  
  /** Number of visits */
  visits: number;
  
  /** Percentage of total traffic */
  percentage: number;
}

/**
 * Geographic statistics
 */
export interface GeoStats {
  /** Country code */
  country: string;
  
  /** Country name */
  countryName: string;
  
  /** Number of visits */
  visits: number;
  
  /** Percentage of total traffic */
  percentage: number;
}

/**
 * Daily page statistics
 */
export interface DailyPageStats {
  /** Date (YYYY-MM-DD) */
  date: string;
  
  /** Page views */
  views: number;
  
  /** Unique visitors */
  uniqueVisitors: number;
  
  /** Average time on page */
  avgTimeOnPage: number;
  
  /** Bounce rate */
  bounceRate: number;
}

/**
 * Site-wide analytics summary
 */
export interface SiteAnalytics extends TimestampFields {
  /** Date range for the summary */
  dateRange: {
    start: FirebaseFirestore.Timestamp;
    end: FirebaseFirestore.Timestamp;
  };
  
  /** Total page views */
  totalViews: number;
  
  /** Unique visitors */
  uniqueVisitors: number;
  
  /** Total sessions */
  totalSessions: number;
  
  /** Average session duration (seconds) */
  avgSessionDuration: number;
  
  /** Site-wide bounce rate */
  bounceRate: number;
  
  /** Pages per session */
  pagesPerSession: number;
  
  /** New vs returning visitors */
  visitorTypes: {
    new: number;
    returning: number;
  };
  
  /** Top pages */
  topPages: Array<{
    page: string;
    title?: string;
    views: number;
    percentage: number;
  }>;
  
  /** Traffic sources */
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  
  /** Device breakdown */
  deviceBreakdown: DeviceStats[];
  
  /** Geographic data */
  geoBreakdown: GeoStats[];
  
  /** Daily trends */
  dailyTrends: Array<{
    date: string;
    views: number;
    visitors: number;
    sessions: number;
  }>;
}

/**
 * Conversion funnel data
 */
export interface ConversionFunnel extends TimestampFields {
  /** Funnel name */
  name: string;
  
  /** Funnel steps */
  steps: FunnelStep[];
  
  /** Total entries */
  totalEntries: number;
  
  /** Final conversions */
  conversions: number;
  
  /** Overall conversion rate */
  conversionRate: number;
  
  /** Date range */
  dateRange: {
    start: FirebaseFirestore.Timestamp;
    end: FirebaseFirestore.Timestamp;
  };
}

/**
 * Funnel step data
 */
export interface FunnelStep {
  /** Step name */
  name: string;
  
  /** Step order */
  order: number;
  
  /** Entries to this step */
  entries: number;
  
  /** Completions of this step */
  completions: number;
  
  /** Step conversion rate */
  conversionRate: number;
  
  /** Drop-off rate */
  dropOffRate: number;
}

/**
 * Real-time analytics data
 */
export interface RealTimeAnalytics {
  /** Current active users */
  activeUsers: number;
  
  /** Current page views in last 30 minutes */
  recentViews: number;
  
  /** Top active pages */
  activePages: Array<{
    page: string;
    activeUsers: number;
  }>;
  
  /** Recent events */
  recentEvents: AnalyticsEvent[];
  
  /** Geographic distribution of active users */
  activeGeo: Array<{
    country: string;
    activeUsers: number;
  }>;
  
  /** Last updated timestamp */
  lastUpdated: FirebaseFirestore.Timestamp;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig extends TimestampFields {
  /** Whether analytics is enabled */
  enabled: boolean;
  
  /** Tracking configuration */
  tracking: {
    /** Track page views */
    pageViews: boolean;
    
    /** Track clicks */
    clicks: boolean;
    
    /** Track form submissions */
    forms: boolean;
    
    /** Track downloads */
    downloads: boolean;
    
    /** Track external links */
    externalLinks: boolean;
    
    /** Track scroll depth */
    scrollDepth: boolean;
    
    /** Track time on page */
    timeOnPage: boolean;
  };
  
  /** Privacy settings */
  privacy: {
    /** Anonymize IP addresses */
    anonymizeIp: boolean;
    
    /** Respect Do Not Track */
    respectDnt: boolean;
    
    /** Cookie consent required */
    cookieConsent: boolean;
    
    /** Data retention period (days) */
    retentionDays: number;
  };
  
  /** Sampling rate (0-100) */
  samplingRate: number;
  
  /** Custom events to track */
  customEvents: CustomEventConfig[];
}

/**
 * Custom event configuration
 */
export interface CustomEventConfig {
  /** Event name */
  name: string;
  
  /** Event category */
  category: string;
  
  /** CSS selector or URL pattern */
  trigger: string;
  
  /** Trigger type */
  triggerType: 'click' | 'submit' | 'pageview' | 'scroll' | 'time';
  
  /** Whether event is enabled */
  enabled: boolean;
  
  /** Custom properties to capture */
  properties?: Record<string, string>;
}

/**
 * Analytics report request
 */
export interface AnalyticsReportRequest {
  /** Report type */
  type: 'overview' | 'pages' | 'referrers' | 'devices' | 'geo' | 'realtime';
  
  /** Date range */
  dateRange: {
    start: Date | FirebaseFirestore.Timestamp;
    end: Date | FirebaseFirestore.Timestamp;
  };
  
  /** Filters */
  filters?: {
    pages?: string[];
    referrers?: string[];
    countries?: string[];
    deviceTypes?: string[];
  };
  
  /** Grouping options */
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  
  /** Metrics to include */
  metrics?: Array<'views' | 'visitors' | 'sessions' | 'bounceRate' | 'avgTime'>;
}

/**
 * Analytics event creation request
 */
export interface CreateAnalyticsEventRequest {
  type: AnalyticsEventType;
  action: string;
  category: string;
  label?: string;
  value?: number;
  page: string;
  referrer?: string;
  sessionId: string;
  properties?: Record<string, any>;
}