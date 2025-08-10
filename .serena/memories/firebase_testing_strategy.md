# Firebase Local Testing Strategy

## Overview
A comprehensive testing framework using Firebase Emulators for complete local development and testing before production deployment. Based on Context7 Firebase documentation and best practices.

## Firebase Emulator Suite

### Available Emulators
1. **Auth Emulator** (Port 9099)
   - Test authentication flows
   - Mock user tokens
   - Domain restriction testing

2. **Firestore Emulator** (Port 8080)
   - Database operations
   - Security rules testing
   - Real-time listeners

3. **Functions Emulator** (Port 5001)
   - Cloud Functions testing
   - HTTP triggers
   - Firestore triggers

4. **Storage Emulator** (Port 9199)
   - File upload/download
   - Security rules testing
   - Mock file operations

5. **Hosting Emulator** (Port 5000)
   - Static file serving
   - Rewrites testing
   - Preview deployments

## Setup & Configuration

### 1. Install Firebase Tools
```bash
npm install -g firebase-tools
```

### 2. Configure Emulators in firebase.json
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### 3. Start Emulators
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators only
firebase emulators:start --only firestore,auth,functions

# Start with import/export data
firebase emulators:start --import=./emulator-data --export-on-exit
```

## Testing Framework: @firebase/rules-unit-testing

### Installation
```bash
npm install --save-dev @firebase/rules-unit-testing
```

### Test Environment Setup
```typescript
import { 
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  withFunctionTriggersDisabled
} from '@firebase/rules-unit-testing';

// Initialize test environment
const testEnv = await initializeTestEnvironment({
  projectId: 'demo-portfolio',
  firestore: {
    rules: fs.readFileSync('firestore.rules', 'utf8'),
  },
  storage: {
    rules: fs.readFileSync('storage.rules', 'utf8'),
  }
});
```

## Security Rules Testing

### Firestore Rules Tests
```typescript
// tests/firestore.rules.test.ts
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-portfolio',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Projects Collection', () => {
    test('allows public read for published projects', async () => {
      // Setup test data
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('projects').doc('project1').set({
          title: 'Test Project',
          isPublished: true
        });
      });

      // Test as unauthenticated user
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        unauthedDb.collection('projects').doc('project1').get()
      );
    });

    test('denies public read for unpublished projects', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('projects').doc('project2').set({
          title: 'Draft Project',
          isPublished: false
        });
      });

      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        unauthedDb.collection('projects').doc('project2').get()
      );
    });

    test('allows admin write access', async () => {
      // Setup admin user
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('admins').doc('admin-uid').set({
          email: 'admin@yourdomain.com',
          role: 'admin'
        });
      });

      // Test as admin
      const adminDb = testEnv.authenticatedContext('admin-uid', {
        email: 'admin@yourdomain.com'
      }).firestore();
      
      await assertSucceeds(
        adminDb.collection('projects').doc('new-project').set({
          title: 'New Project',
          isPublished: false
        })
      );
    });

    test('denies non-admin write access', async () => {
      const userDb = testEnv.authenticatedContext('regular-user', {
        email: 'user@example.com'
      }).firestore();
      
      await assertFails(
        userDb.collection('projects').doc('project3').set({
          title: 'Unauthorized Project'
        })
      );
    });
  });

  describe('Messages Collection', () => {
    test('allows public to create messages', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        unauthedDb.collection('messages').add({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message'
        })
      );
    });

    test('validates required fields for messages', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        unauthedDb.collection('messages').add({
          name: 'John Doe'
          // Missing required email and message fields
        })
      );
    });
  });
});
```

### Storage Rules Tests
```typescript
// tests/storage.rules.test.ts
describe('Storage Security Rules', () => {
  test('allows public read for project images', async () => {
    const unauthedStorage = testEnv.unauthenticatedContext().storage();
    await assertSucceeds(
      unauthedStorage.ref('projects/image.jpg').getDownloadURL()
    );
  });

  test('allows admin to upload images', async () => {
    const adminStorage = testEnv.authenticatedContext('admin-uid', {
      email: 'admin@yourdomain.com'
    }).storage();
    
    const file = new Blob(['image data'], { type: 'image/jpeg' });
    await assertSucceeds(
      adminStorage.ref('projects/new-image.jpg').put(file)
    );
  });

  test('enforces file size limits for resumes', async () => {
    const adminStorage = testEnv.authenticatedContext('admin-uid', {
      email: 'admin@yourdomain.com'
    }).storage();
    
    // Create 11MB file (exceeds 10MB limit)
    const largeFile = new Blob([new ArrayBuffer(11 * 1024 * 1024)], {
      type: 'application/pdf'
    });
    
    await assertFails(
      adminStorage.ref('resumes/large.pdf').put(largeFile)
    );
  });
});
```

## Cloud Functions Testing

### Unit Tests for Functions
```typescript
// functions/src/test/email.test.ts
import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';

const test = functions({
  projectId: 'demo-portfolio',
});

describe('sendContactEmail', () => {
  let sendContactEmail: any;
  let transporterStub: any;

  beforeAll(() => {
    // Mock nodemailer
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
      })
    }));
    
    sendContactEmail = require('../email').sendContactEmail;
  });

  afterAll(() => {
    test.cleanup();
  });

  test('sends email when message is created', async () => {
    const messageData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    // Create a wrapped function
    const wrapped = test.wrap(sendContactEmail);
    
    // Create a mock snapshot
    const snap = test.firestore.makeDocumentSnapshot(
      messageData,
      'messages/message1'
    );

    // Call the wrapped function
    await wrapped(snap, {
      params: { messageId: 'message1' }
    });

    // Verify email was sent
    expect(transporterStub.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'your-email@domain.com',
        subject: expect.stringContaining('Test Subject')
      })
    );
  });

  test('implements rate limiting', async () => {
    // Test that rapid submissions are blocked
    const wrapped = test.wrap(sendContactEmail);
    
    // First submission should succeed
    const snap1 = test.firestore.makeDocumentSnapshot(
      { name: 'User1', email: 'user1@test.com', message: 'Message 1' },
      'messages/msg1'
    );
    await expect(wrapped(snap1)).resolves.not.toThrow();

    // Immediate second submission should fail
    const snap2 = test.firestore.makeDocumentSnapshot(
      { name: 'User2', email: 'user2@test.com', message: 'Message 2' },
      'messages/msg2'
    );
    await expect(wrapped(snap2)).rejects.toThrow('Too many requests');
  });
});
```

### Integration Tests with Emulators
```typescript
// tests/integration/functions.test.ts
import * as admin from 'firebase-admin';
import { connectFunctionsEmulator } from 'firebase/functions';

describe('Functions Integration Tests', () => {
  beforeAll(() => {
    // Connect to emulators
    connectFunctionsEmulator(functions, 'localhost', 5001);
  });

  test('contact form triggers email function', async () => {
    // Add a message to trigger the function
    await admin.firestore().collection('messages').add({
      name: 'Integration Test',
      email: 'test@example.com',
      message: 'Testing email trigger'
    });

    // Wait for function to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify analytics event was created
    const analytics = await admin.firestore()
      .collection('analytics')
      .where('type', '==', 'contactSubmit')
      .get();
    
    expect(analytics.size).toBe(1);
  });
});
```

## Authentication Testing

### Mock User Tokens
```typescript
describe('Authentication Tests', () => {
  test('admin authentication with mock token', async () => {
    const mockUserToken = {
      uid: 'admin-uid',
      email: 'admin@yourdomain.com',
      email_verified: true,
      firebase: {
        sign_in_provider: 'google.com'
      }
    };

    const adminContext = testEnv.authenticatedContext('admin-uid', mockUserToken);
    const db = adminContext.firestore();
    
    // Verify admin can write to protected collections
    await assertSucceeds(
      db.collection('settings').doc('main').update({
        siteTitle: 'Updated Title'
      })
    );
  });

  test('domain restriction enforcement', async () => {
    const unauthorizedToken = {
      uid: 'external-user',
      email: 'user@external.com',
      email_verified: true
    };

    const externalContext = testEnv.authenticatedContext('external-user', unauthorizedToken);
    const db = externalContext.firestore();
    
    // Verify external domain users cannot write
    await assertFails(
      db.collection('projects').doc('test').set({
        title: 'Unauthorized'
      })
    );
  });
});
```

## End-to-End Testing

### Complete Workflow Tests
```typescript
// tests/e2e/portfolio.test.ts
describe('Portfolio E2E Tests', () => {
  beforeAll(async () => {
    // Start all emulators
    await exec('firebase emulators:start --project=demo-portfolio');
    
    // Wait for emulators to be ready
    await waitForEmulators();
  });

  afterAll(async () => {
    await exec('firebase emulators:stop');
  });

  test('complete project creation workflow', async () => {
    // 1. Admin signs in
    const adminAuth = await signInWithGoogle('admin@yourdomain.com');
    
    // 2. Create new project
    const projectData = {
      title: 'E2E Test Project',
      description: 'Testing complete workflow',
      technologies: ['Firebase', 'React'],
      imageUrl: 'https://example.com/image.jpg',
      isPublished: false,
      featured: false,
      order: 1
    };
    
    const projectRef = await admin.firestore()
      .collection('projects')
      .add(projectData);
    
    // 3. Upload project image
    const imageFile = new File(['image'], 'project.jpg', { type: 'image/jpeg' });
    await admin.storage()
      .ref(`projects/${projectRef.id}.jpg`)
      .put(imageFile);
    
    // 4. Publish project
    await projectRef.update({ isPublished: true });
    
    // 5. Verify public can read
    const publicDb = getFirestore();  // Unauthenticated
    const project = await getDoc(doc(publicDb, 'projects', projectRef.id));
    expect(project.exists()).toBe(true);
    expect(project.data()?.title).toBe('E2E Test Project');
  });

  test('contact form submission flow', async () => {
    // 1. Submit contact form
    const formData = {
      name: 'E2E Tester',
      email: 'e2e@test.com',
      subject: 'E2E Test Message',
      message: 'Testing contact form submission'
    };
    
    await addDoc(collection(getFirestore(), 'messages'), {
      ...formData,
      status: 'unread',
      createdAt: serverTimestamp()
    });
    
    // 2. Wait for email function to process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Verify analytics event
    const analytics = await getDocs(
      query(
        collection(getFirestore(), 'analytics'),
        where('type', '==', 'contactSubmit')
      )
    );
    expect(analytics.size).toBeGreaterThan(0);
  });
});
```

## Test Automation & CI/CD

### Package.json Scripts
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testMatch='**/*.test.ts' --testPathIgnorePatterns='/integration/'",
    "test:integration": "firebase emulators:exec --project=demo-portfolio 'jest --testMatch='**/integration/**/*.test.ts''",
    "test:rules": "firebase emulators:exec --project=demo-portfolio 'jest --testMatch='**/*.rules.test.ts''",
    "test:e2e": "firebase emulators:exec --project=demo-portfolio 'jest --testMatch='**/e2e/**/*.test.ts''",
    "test:functions": "cd functions && npm test",
    "emulators:start": "firebase emulators:start --import=./emulator-data",
    "emulators:export": "firebase emulators:export ./emulator-data"
  }
}
```

### GitHub Actions CI
```yaml
# .github/workflows/test.yml
name: Firebase Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm install
        cd functions && npm install
    
    - name: Install Firebase CLI
      run: npm install -g firebase-tools
    
    - name: Run Unit Tests
      run: npm run test:unit
    
    - name: Run Security Rules Tests
      run: npm run test:rules
    
    - name: Run Integration Tests
      run: npm run test:integration
    
    - name: Run E2E Tests
      run: npm run test:e2e
```

## Test Data Management

### Seeding Test Data
```typescript
// scripts/seed-test-data.ts
async function seedTestData() {
  const db = getFirestore();
  
  // Seed projects
  const projects = [
    {
      title: 'Test Project 1',
      description: 'Published project for testing',
      isPublished: true,
      featured: true
    },
    {
      title: 'Test Project 2', 
      description: 'Draft project for testing',
      isPublished: false,
      featured: false
    }
  ];
  
  for (const project of projects) {
    await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  // Seed admin user
  await setDoc(doc(db, 'admins', 'test-admin'), {
    email: 'admin@yourdomain.com',
    name: 'Test Admin',
    role: 'super_admin',
    createdAt: serverTimestamp()
  });
  
  // Seed settings
  await setDoc(doc(db, 'settings', 'main'), {
    siteTitle: 'Test Portfolio',
    siteDescription: 'Testing environment',
    emailNotifications: true
  });
  
  console.log('Test data seeded successfully');
}
```

### Exporting/Importing Emulator Data
```bash
# Export current emulator state
firebase emulators:export ./emulator-data

# Start emulators with imported data
firebase emulators:start --import=./emulator-data

# Auto-export on exit
firebase emulators:start --import=./emulator-data --export-on-exit
```

## Performance Testing

### Load Testing Functions
```typescript
// tests/performance/load.test.ts
describe('Load Tests', () => {
  test('handles concurrent contact form submissions', async () => {
    const submissions = Array(50).fill(null).map((_, i) => ({
      name: `User ${i}`,
      email: `user${i}@test.com`,
      message: `Message ${i}`
    }));
    
    const promises = submissions.map(data => 
      addDoc(collection(getFirestore(), 'messages'), data)
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    // Expect rate limiting to kick in
    expect(successful.length).toBeLessThan(50);
    expect(successful.length).toBeGreaterThan(0);
  });
  
  test('firestore handles concurrent reads', async () => {
    const db = getFirestore();
    
    // Perform 100 concurrent reads
    const reads = Array(100).fill(null).map(() => 
      getDocs(collection(db, 'projects'))
    );
    
    const startTime = Date.now();
    await Promise.all(reads);
    const duration = Date.now() - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000);
  });
});
```

## Debug & Troubleshooting

### Enable Debug Logging
```bash
# Enable Firebase debug logging
export FIREBASE_DEBUG=true
firebase emulators:start

# Enable specific emulator logging
firebase emulators:start --debug
```

### Common Issues & Solutions

1. **Port Already in Use**
```json
// firebase.json - Use alternative ports
{
  "emulators": {
    "firestore": { "port": 8081 },
    "auth": { "port": 9098 }
  }
}
```

2. **Emulator Data Persistence**
```bash
# Always export data before stopping
firebase emulators:start --export-on-exit=./backup
```

3. **Test Isolation**
```typescript
// Clear data between tests
afterEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});
```

## Best Practices

### 1. Test Organization
- Separate unit, integration, and e2e tests
- Use descriptive test names
- Group related tests in describe blocks

### 2. Mock Data
- Use realistic test data
- Create data factories for consistency
- Clean up after each test

### 3. Security Testing
- Test both positive and negative cases
- Verify all security rules paths
- Test edge cases and boundaries

### 4. Performance Considerations
- Use `--only` flag to run specific emulators
- Export/import data for faster setup
- Run tests in parallel when possible

### 5. CI/CD Integration
- Run tests on every pull request
- Use GitHub Actions or similar
- Cache dependencies for faster runs

## Summary

This comprehensive testing strategy ensures:
- ✅ Complete local development without production risks
- ✅ Security rules validation before deployment
- ✅ Function testing with realistic scenarios
- ✅ Performance validation under load
- ✅ Automated testing in CI/CD pipeline
- ✅ Cost-effective development (no Firebase usage charges)

The Firebase Emulator Suite combined with @firebase/rules-unit-testing provides a production-like environment for thorough testing of all Firebase services before deployment.