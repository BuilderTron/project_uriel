# Firebase Backend Architecture

## Firestore Collections Structure

### Core Collections

#### `projects`
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  category: 'web' | 'mobile' | 'design' | 'other';
  featured: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublished: boolean;
}
```

#### `resume`
```typescript
interface Resume {
  id: string;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  currentResumeUrl: string;  // PDF URL in Storage
  updatedAt: Timestamp;
}
```

#### `messages` (Contact Form)
```typescript
interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Timestamp;
  repliedAt?: Timestamp;
}
```

#### `analytics`
```typescript
interface AnalyticsEvent {
  id: string;
  type: 'pageView' | 'projectView' | 'resumeDownload' | 'contactSubmit';
  page?: string;
  projectId?: string;
  userAgent: string;
  ip?: string;
  sessionId: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}
```

#### `settings`
```typescript
interface SiteSettings {
  id: 'main';
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  emailNotifications: boolean;
  googleAnalyticsId?: string;
}
```

#### `admins`
```typescript
interface AdminUser {
  id: string; // Firebase UID
  email: string;
  name: string;
  photoURL?: string;
  role: 'super_admin' | 'admin';
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

## Firebase Storage Structure

```
/projects/
  ├── project-1-image.jpg
  ├── project-1-thumbnail.jpg
  └── project-2-image.png

/resumes/
  ├── resume_20241201.pdf
  └── resume_20241215.pdf
```

## Cloud Functions

### `sendContactEmail`
- **Trigger**: New document in `messages` collection
- **Purpose**: Send email notification for contact form submissions
- **Dependencies**: Nodemailer for Gmail SMTP

### `aggregateAnalytics`
- **Trigger**: Scheduled function (daily)
- **Purpose**: Aggregate analytics data for dashboard
- **Operations**: Count page views, track popular projects

### `cleanupOldFiles`
- **Trigger**: Scheduled function (weekly)
- **Purpose**: Remove old resume files from Storage
- **Logic**: Keep only the 3 most recent resume versions

## Security Rules Overview

### Firestore Rules Strategy
- **Public Read**: Published projects, resume, settings
- **Admin Write**: All collections require admin authentication
- **Domain Restriction**: Only @yourdomain.com Google accounts
- **Helper Functions**: `isAdmin()` function for reusability

### Storage Rules Strategy
- **Public Read**: All uploaded files (projects, resumes)
- **Admin Write**: Only domain-restricted users can upload
- **File Type Validation**: Server-side validation in Functions