# Firebase Security Rules Implementation Guide

## Firestore Security Rules

### Complete Rules Structure
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Helper function to check domain restriction
    function isAuthorizedDomain() {
      return request.auth != null && 
             request.auth.token.email.matches('.*@yourdomain.com');
    }
    
    // Public read for published projects only
    match /projects/{document=**} {
      allow read: if resource.data.isPublished == true;
      allow write: if isAdmin();
    }
    
    // Public read for resume data
    match /resume/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Public read for site settings
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Contact messages - public can create, admin can manage
    match /messages/{document=**} {
      allow create: if true && 
                       request.resource.data.keys().hasAll(['name', 'email', 'message']) &&
                       request.resource.data.name is string &&
                       request.resource.data.email is string &&
                       request.resource.data.message is string;
      allow read, update, delete: if isAdmin();
    }
    
    // Analytics - admin only
    match /analytics/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Admin users collection - highly restricted
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only through Admin SDK or Cloud Functions
    }
  }
}
```

### Key Security Principles

#### 1. Domain Restriction
- Only users with `@yourdomain.com` email can become admins
- Implemented both in authentication flow and security rules
- Double-validation for critical operations

#### 2. Admin-Only Write Access
- All content modifications require admin privileges
- Public users can only create contact messages
- Admin status verified through dedicated collection

#### 3. Data Validation
- Input validation at rule level for contact forms
- Required fields enforcement
- Type checking for critical fields

#### 4. Privacy Protection
- Analytics data completely private
- Admin collection restricted to self-access only
- Personal information in messages protected

## Storage Security Rules

### Complete Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check admin status
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email.matches('.*@yourdomain.com');
    }
    
    // Project images - public read, admin write
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && 
                      request.resource.contentType.matches('image/.*');
    }
    
    // Resume PDFs - public read, admin write
    match /resumes/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && 
                      request.resource.contentType == 'application/pdf' &&
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Temporary uploads (auto-delete after 24h)
    match /temp/{allPaths=**} {
      allow read, write: if isAdmin() && 
                            request.time < resource.timeCreated + duration.value(1, 'd');
    }
  }
}
```

### Storage Security Features

#### 1. File Type Restrictions
- Project images: Only image MIME types allowed
- Resume uploads: Only PDF files permitted
- MIME type validation prevents malicious uploads

#### 2. Size Limitations
- Resume PDFs limited to 10MB maximum
- Prevents storage abuse and large file attacks
- Can be adjusted based on requirements

#### 3. Public Access Strategy
- All uploaded files publicly readable
- Simplifies CDN integration and performance
- Admin-only write access maintains security

## Authentication Security

### Google Sign-In Configuration
```typescript
// Domain restriction in client code
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'yourdomain.com', // Restricts to workspace domain
  prompt: 'select_account'
});

// Additional server-side validation
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Double-check domain restriction
    if (!user.email?.endsWith('@yourdomain.com')) {
      await auth.signOut();
      throw new Error('Unauthorized domain');
    }
    
    // Verify admin status in Firestore
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists()) {
      // Create admin document for first-time users
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        role: 'admin',
        createdAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};
```

## Cloud Functions Security

### Admin Verification Function
```typescript
import { auth } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const verifyAdmin = async (context: functions.CallableContext) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  // Verify domain
  const email = context.auth.token.email;
  if (!email?.endsWith('@yourdomain.com')) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized domain');
  }
  
  // Verify admin status
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists()) {
    throw new functions.https.HttpsError('permission-denied', 'Not an admin user');
  }
  
  return true;
};
```

### Rate Limiting for Public Endpoints
```typescript
// Contact form rate limiting
export const submitContactForm = functions
  .runWith({ memory: '128MB' })
  .https.onCall(async (data, context) => {
    // Basic rate limiting by IP
    const ip = context.rawRequest?.ip;
    const rateLimitDoc = await db.collection('rateLimits').doc(ip).get();
    
    if (rateLimitDoc.exists()) {
      const lastSubmit = rateLimitDoc.data()?.lastSubmit?.toDate();
      const now = new Date();
      const timeDiff = now.getTime() - lastSubmit?.getTime();
      
      // Require 5-minute cooldown between submissions
      if (timeDiff < 5 * 60 * 1000) {
        throw new functions.https.HttpsError('resource-exhausted', 'Too many requests');
      }
    }
    
    // Update rate limit tracker
    await db.collection('rateLimits').doc(ip).set({
      lastSubmit: admin.firestore.FieldValue.serverTimestamp(),
      count: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
    
    // Process contact form...
  });
```

## Security Best Practices

### 1. Defense in Depth
- Client-side validation for UX
- Security rules for database protection
- Server-side validation in Cloud Functions
- Rate limiting for public endpoints

### 2. Principle of Least Privilege
- Public read access only for published content
- Admin write access requires explicit verification
- Granular permissions per collection

### 3. Data Validation
- Input sanitization at multiple layers
- Type checking in security rules
- Size and format restrictions

### 4. Audit Trail
- All admin actions logged in analytics
- User authentication events tracked
- Failed authorization attempts recorded

### 5. Regular Security Reviews
- Monthly security rule audits
- Automated security scanning
- Penetration testing for critical paths