# Backend Service Memory

This document provides specific guidance for working with Firebase backend services in Project Uriel.

## Tech Stack Details

### Core Technologies
- **Firebase Platform** - Serverless backend infrastructure
- **Cloud Functions** - Node.js 18+ runtime with TypeScript
- **Firestore** - NoSQL document database
- **Firebase Auth** - Authentication and authorization
- **Firebase Storage** - File storage and CDN
- **Firebase Hosting** - Static site hosting with CDN

### Development Tools
- **Firebase Emulator Suite** - Local development environment
- **TypeScript 5.3+** - Type safety for Cloud Functions
- **Firebase Admin SDK** - Server-side operations
- **Jest** - Testing framework for functions
- **Firebase CLI** - Deployment and management

## Project Structure

```
services/backend/
├── functions/
│   ├── src/
│   │   ├── index.ts         # Main entry point
│   │   ├── api/             # HTTP endpoints
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── projects/    # Portfolio projects API
│   │   │   ├── blog/        # Blog posts API
│   │   │   └── contact/     # Contact form handler
│   │   ├── triggers/        # Firestore triggers
│   │   │   ├── users/       # User-related triggers
│   │   │   └── analytics/   # Analytics aggregation
│   │   ├── scheduled/       # Cron jobs
│   │   │   └── maintenance/ # Cleanup and maintenance
│   │   ├── lib/            # Shared libraries
│   │   │   ├── email/      # Email service
│   │   │   ├── storage/    # Storage utilities
│   │   │   └── validation/ # Input validation
│   │   └── types/          # TypeScript definitions
│   ├── tests/              # Test files
│   ├── .env.local          # Local environment variables
│   ├── package.json
│   └── tsconfig.json
├── firestore/
│   ├── firestore.rules     # Security rules
│   ├── firestore.indexes.json # Composite indexes
│   └── seed/               # Seed data for development
└── storage/
    └── storage.rules       # Storage security rules
```

## Critical Implementation Guidelines

### 1. Always Reference Context7
- **MANDATORY**: Use context7 for Firebase best practices and patterns
- Check context7 for security rule examples
- Reference context7 for Cloud Functions optimization
- Follow context7 guidelines for Firestore data modeling

### 2. Cloud Functions Best Practices

```typescript
// Always use TypeScript with proper typing
import * as functions from 'firebase-functions';
import { Request, Response } from 'firebase-functions';

// Use environment configuration
const config = functions.config();

// Implement proper error handling
export const apiEndpoint = functions
  .region('us-central1') // Always specify region
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB'
  })
  .https.onRequest(async (req: Request, res: Response) => {
    try {
      // Enable CORS for frontend
      res.set('Access-Control-Allow-Origin', config.app.url);
      
      // Validate input
      const { error, value } = validateInput(req.body);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Process request
      const result = await processRequest(value);
      
      // Return response
      return res.status(200).json({ data: result });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  });
```

### 3. Firestore Data Modeling

```typescript
// Collections structure with TypeScript interfaces
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  createdAt: FirebaseFirestore.Timestamp;
  publishedAt?: FirebaseFirestore.Timestamp;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown
  excerpt: string;
  coverImage: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  views: number;
  createdAt: FirebaseFirestore.Timestamp;
  publishedAt?: FirebaseFirestore.Timestamp;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: FirebaseFirestore.Timestamp;
}
```

### 4. Security Rules Patterns

```javascript
// firestore.rules - Always use context7 for latest patterns
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && 
        request.auth.uid == userId;
    }
    
    // Public read for projects and blog posts
    match /projects/{projectId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    
    match /blog-posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    
    // Contact messages - write only for public
    match /contact-messages/{messageId} {
      allow create: if request.resource.data.keys().hasAll([
        'name', 'email', 'subject', 'message'
      ]) && request.resource.data.email is string;
      allow read, update: if isAdmin();
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['role', 'uid']);
      allow create, delete: if isAdmin();
    }
  }
}
```

### 5. Cloud Functions Categories

#### HTTP Functions (API Endpoints)
```typescript
// API versioning pattern
const v1 = express();

v1.use(cors({ origin: true }));
v1.use(validateApiKey);

// Projects endpoints
v1.get('/projects', getProjects);
v1.get('/projects/:id', getProject);
v1.post('/projects', requireAdmin, createProject);
v1.put('/projects/:id', requireAdmin, updateProject);
v1.delete('/projects/:id', requireAdmin, deleteProject);

// Blog endpoints
v1.get('/blog/posts', getBlogPosts);
v1.get('/blog/posts/:slug', getBlogPost);
v1.post('/blog/posts', requireAdmin, createBlogPost);

// Contact endpoint
v1.post('/contact', rateLimit, sendContactMessage);

export const api = functions.https.onRequest(v1);
```

#### Firestore Triggers
```typescript
// User creation trigger
export const onUserCreated = functions
  .firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    
    // Send welcome email
    await sendWelcomeEmail(userData.email, userData.displayName);
    
    // Initialize user preferences
    await initializeUserPreferences(context.params.userId);
    
    // Log analytics event
    await logEvent('user_created', { userId: context.params.userId });
  });

// Blog post view counter
export const incrementBlogViews = functions
  .firestore
  .document('blog-posts/{postId}/views/{viewId}')
  .onCreate(async (snap, context) => {
    const postRef = admin.firestore()
      .collection('blog-posts')
      .doc(context.params.postId);
    
    await postRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });
  });
```

#### Scheduled Functions
```typescript
// Daily cleanup job
export const dailyCleanup = functions
  .pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    // Clean up old sessions
    await cleanupExpiredSessions();
    
    // Aggregate analytics
    await aggregateAnalytics();
    
    // Send daily report
    await sendDailyReport();
  });
```

### 6. Testing Requirements

```typescript
// Example test for Cloud Function
describe('Contact Form Handler', () => {
  let testEnv: functions.TestEnvironment;
  
  beforeAll(async () => {
    testEnv = await functions.initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });
  
  afterAll(() => testEnv.cleanup());
  
  test('should send contact message', async () => {
    const wrapped = testEnv.wrap(contactFormHandler);
    const result = await wrapped({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message'
    });
    
    expect(result.success).toBe(true);
  });
});
```

### 7. Performance Optimization

#### Function Cold Starts
```typescript
// Minimize dependencies
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Lazy initialization
let db: FirebaseFirestore.Firestore;

function getDb() {
  if (!db) {
    initializeApp();
    db = getFirestore();
  }
  return db;
}
```

#### Firestore Optimization
```typescript
// Use batch operations
async function batchUpdate(updates: Update[]) {
  const batch = db.batch();
  
  updates.forEach(({ ref, data }) => {
    batch.update(ref, data);
  });
  
  await batch.commit();
}

// Implement pagination
async function getPaginatedPosts(
  lastDoc?: FirebaseFirestore.DocumentSnapshot,
  limit = 10
) {
  let query = db.collection('blog-posts')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit);
    
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  return query.get();
}
```

### 8. Email Service Integration

```typescript
// Using SendGrid for transactional emails
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(functions.config().sendgrid.key);

export async function sendContactNotification(
  message: ContactMessage
) {
  const msg = {
    to: functions.config().app.admin_email,
    from: functions.config().sendgrid.from_email,
    subject: `New Contact: ${message.subject}`,
    html: generateContactEmailHtml(message),
  };
  
  await sgMail.send(msg);
}
```

## Development Workflow

### 1. Local Development Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Deploy functions to emulator
npm run serve
```

### 2. Environment Configuration
```bash
# Set local environment variables
firebase functions:config:set app.url="http://localhost:5173"
firebase functions:config:set sendgrid.key="your-key"
firebase functions:config:set app.admin_email="admin@example.com"

# Get current configuration
firebase functions:config:get

# For local development, create .env.local
FIREBASE_CONFIG='{"projectId":"project-uriel-local"}'
```

### 3. Deployment Process
```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:apiEndpoint

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy to specific project
firebase use staging
firebase deploy
```

## Security Checklist

- [ ] All API endpoints have proper authentication
- [ ] Input validation on all user inputs
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured
- [ ] Secrets stored in Firebase config, not code
- [ ] Security rules tested with emulator
- [ ] No sensitive data in logs
- [ ] API keys have proper restrictions
- [ ] Regular security audits scheduled

## Monitoring and Debugging

### 1. Logging Best Practices
```typescript
// Structured logging
import { logger } from 'firebase-functions';

logger.info('Processing request', {
  userId: req.auth?.uid,
  action: 'create_project',
  metadata: { projectId: project.id }
});

logger.error('Failed to send email', {
  error: error.message,
  stack: error.stack,
  context: { userId, emailType: 'welcome' }
});
```

### 2. Performance Monitoring
- Enable Firebase Performance Monitoring
- Set up custom traces for critical paths
- Monitor function execution times
- Track Firestore read/write operations

### 3. Error Tracking
```typescript
// Integrate with Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: functions.config().sentry.dsn,
  environment: functions.config().app.environment,
});

// Wrap functions with error tracking
export const apiEndpoint = functions.https.onRequest(
  Sentry.GCPFunction.wrapHttpFunction(handler)
);
```

## Cost Optimization

### 1. Firestore Usage
- Use compound queries to reduce reads
- Implement proper caching strategies
- Archive old data to reduce storage costs
- Use Firestore bundles for static data

### 2. Cloud Functions
- Set appropriate memory limits
- Use minimum runtime where possible
- Implement function concurrency limits
- Clean up temporary files

### 3. Storage
- Implement lifecycle rules for old files
- Use appropriate storage classes
- Compress images before upload
- Implement CDN caching

## Common Issues and Solutions

### Issue: Cold Start Latency
**Solution**: Keep functions warm with scheduled pings or use minimum instances

### Issue: Firestore Transaction Conflicts
**Solution**: Implement exponential backoff and retry logic

### Issue: Memory Leaks in Functions
**Solution**: Properly dispose of resources and avoid global state

### Issue: CORS Errors
**Solution**: Configure CORS properly in Express middleware

## Firestore Data Model & Security Rules Implementation (PU-7)

### TypeScript Data Model Architecture

Comprehensive TypeScript interfaces for all Firestore collections:

```typescript
// Core Collections Structure:
// - users: User profiles with RBAC
// - projects: Portfolio project showcase  
// - blog-posts: Blog system with SEO
// - contact-messages: Contact form submissions
// - experience: Professional experience timeline
// - analytics: Usage tracking and metrics
// - config: Application configuration

// Example: User data model with role-based access
export interface User extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole; // 'admin' | 'user'
  preferences?: UserPreferences;
  isActive: boolean;
}

// Helper types for consistent field validation
export interface BaseDocument {
  id: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

### Enhanced Security Rules with Context7 Patterns

Security rules implementing RBAC with comprehensive validation:

```javascript
// Helper functions for authentication and validation
function isAuthenticated() {
  return request.auth != null;
}

function isAdmin() {
  return isAuthenticated() && 
         request.auth.token.role == 'admin';
}

function isValidEmail(email) {
  return email is string && 
         email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
}

function isValidString(field, minLen, maxLen) {
  return field is string && 
         field.size() >= minLen && 
         field.size() <= maxLen;
}

// Example: Project collection rules
match /projects/{projectId} {
  allow read: if resource.data.status == 'published';
  allow create: if isAdmin() && 
    request.resource.data.keys().hasAll(['title', 'description', 'technologies']) &&
    isValidString(request.resource.data.title, 1, 200);
  allow update: if isAdmin() &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasAll(['updatedAt', 'updatedBy']);
  allow delete: if isAdmin();
}
```

### Security Rule Validation Patterns

- **Input Validation**: Email format, string length, required fields
- **RBAC Implementation**: Admin/user role separation with token validation
- **Data Access Patterns**: Public read for published content, admin-only management
- **Field-Level Security**: Prevent unauthorized modification of sensitive fields

### Composite Index Strategy

Optimized Firestore indexes for efficient queries:

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "featured", "order": "DESCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "blog-posts", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Testing & Validation Integration

Integration with nuclear reset testing for reliability:

```bash
# Verification workflow:
1. Docker container rebuild from scratch (--no-cache)
2. TypeScript compilation validation
3. Firebase emulator startup verification
4. Security rules syntax validation
5. API accessibility testing

# All PU-7 components tested in clean environment
```

## Git Hooks and Quality Assurance

### Firebase-Specific Git Hooks (PU-6)

Project Uriel implements comprehensive git hooks for Firebase validation:

#### Pre-Push Hook Features
```bash
# Located at: .git/hooks/pre-push
# Enhanced Firebase validation including:

1. Branch naming validation (feature/PU-XXX-description)
2. Firebase configuration validation (firebase.json, .firebaserc)
3. Firestore security rules testing with emulators
4. Cloud Functions TypeScript compilation
5. Cloud Functions ESLint validation
6. Performance warnings for function timeouts/memory
```

#### Commit Message Hook
```bash
# Located at: .git/hooks/commit-msg
# Enforces conventional commits with Firebase scopes:

feat(functions): add contact form handler
fix(rules): correct user permission validation
docs(deploy): update deployment guide
chore(deps): update Firebase SDK to v10
```

#### Firebase Validation Commands
```bash
# Available in scripts/commands.sh:

firebase:validate-all      # Run complete Firebase validation
firebase:validate-rules    # Test Firestore/Storage security rules
firebase:lint-functions    # ESLint + TypeScript for Cloud Functions
firebase:test-functions    # Run Cloud Functions unit tests
firebase:check-config      # Validate Firebase configuration files
```

### GitHub Actions CI Pipeline

Automated validation pipeline with Firebase-specific checks:

```yaml
# .github/workflows/ci.yml includes:

1. Conventional commit validation
2. Firebase configuration syntax checks
3. Security rules testing with emulators
4. Cloud Functions compilation and linting
5. Integration tests with Docker
6. Security audits and branch naming validation
```

### Quality Gates

Before code reaches production, it must pass:

- ✅ Branch naming follows PU-XXX convention
- ✅ Commits follow conventional format
- ✅ Firebase configuration is valid JSON
- ✅ Security rules pass emulator tests
- ✅ Cloud Functions compile and pass linting
- ✅ Integration tests pass with Docker services
- ✅ No high-severity security vulnerabilities

## References

- Always check context7 for latest Firebase patterns
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Best Practices](https://cloud.google.com/functions/docs/bestpractices)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message standards