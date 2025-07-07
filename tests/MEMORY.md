# Tests Memory

This document provides guidance for testing practices and infrastructure in Project Uriel.

## Overview

Project Uriel uses a comprehensive testing strategy with multiple layers of testing, from unit tests to deployment verification. All tests are designed to run both locally and in CI/CD pipelines.

## Test Structure

**Note**: While this centralized test structure is documented, the project currently uses a distributed testing approach where tests live alongside the code they test (e.g., `__tests__` directories within service folders). This provides better locality and makes it easier to maintain tests with their corresponding code.

```
tests/                     # Centralized test documentation and utilities
├── MEMORY.md              # This file - testing guidance
├── README.md              # Test documentation
├── deployment/           # Deployment verification scripts
│   ├── test-deploy-scripts.sh  # Script validation
│   ├── staging/          # Staging verification
│   │   └── verify.sh
│   └── production/       # Production smoke tests
│       └── smoke-test.sh
└── scripts/              # Test utilities
    └── run-all.sh        # Master test runner

# Actual test locations (distributed approach):
services/
├── backend/
│   └── functions/
│       └── __tests__/    # Backend unit tests
│           ├── middleware/
│           ├── utils/
│           └── api/
└── frontend/
    └── webapp/
        └── src/
            └── __tests__/  # Frontend unit tests
                ├── components/
                ├── hooks/
                └── utils/
```

## Testing Commands (Always Use These!)

From project root with commands loaded (`source activate`):

### Core Testing Commands
```bash
# Run all tests
test

# Run specific test suites
test:frontend           # React component tests
test:backend           # Cloud Functions tests
test:e2e              # End-to-end tests with Playwright

# Deployment testing
test:deployment       # Validate deployment scripts
test:staging         # Verify staging deployment health
test:production      # Production smoke tests after deployment
```

### Advanced Testing
```bash
# Full test suite (includes everything)
test:all

# Manual test runners
./tests/scripts/run-all.sh
./tests/deployment/test-deploy-scripts.sh
```

## Testing Strategy

### 1. Unit Tests
- **Location**: `tests/unit/`
- **Purpose**: Test individual components/functions in isolation
- **Framework**: Vitest (frontend), Jest (backend)
- **Run**: `test:frontend` or `test:backend`
- **Speed**: Very fast (< 1s per test)

### 2. Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test service interactions
- **Includes**: API endpoints, Firebase rules, service communication
- **Run**: Part of `test:all`
- **Speed**: Fast (< 5s per test)

### 3. End-to-End Tests
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user journeys
- **Framework**: Playwright
- **Run**: `test:e2e`
- **Speed**: Slow (30s+ per test)

### 4. Deployment Tests
- **Location**: `tests/deployment/`
- **Purpose**: Verify deployment readiness and health
- **Types**: Script validation, staging verification, production smoke tests
- **Run**: `test:deployment`, `test:staging`, `test:production`

## Test Patterns

### Frontend Testing (Vitest + React Testing Library)
```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProjectCard } from './ProjectCard'

describe('ProjectCard', () => {
  it('displays project information', () => {
    const project = { title: 'Test Project', description: 'Test desc' }
    render(<ProjectCard project={project} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Test desc')).toBeInTheDocument()
  })
})
```

### Backend Testing (Jest + Firebase Admin)
```typescript
// Cloud Function test example
import { describe, it, expect } from '@jest/globals'
import * as admin from 'firebase-admin'
import { contactFormHandler } from '../src/contact'

describe('Contact Form', () => {
  it('sends email when valid data provided', async () => {
    const mockRequest = {
      body: { name: 'Test', email: 'test@example.com', message: 'Hello' }
    }
    
    const result = await contactFormHandler(mockRequest)
    expect(result.success).toBe(true)
  })
})
```

### Deployment Testing
```bash
# Deployment script validation
./tests/deployment/test-deploy-scripts.sh

# Staging health check
./tests/deployment/staging/verify.sh

# Production smoke test
./tests/deployment/production/smoke-test.sh "https://project-uriel.com"
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# Tests run automatically on:
- push: Unit + Integration tests
- pull_request: All tests including E2E
- deployment: Deployment verification
```

### Test Stages
1. **Pre-commit**: Lint + Type check (via git hooks)
2. **Pre-push**: Unit + Integration tests (via git hooks)
3. **PR**: Full test suite including E2E
4. **Pre-deployment**: Deployment script validation
5. **Post-deployment**: Health checks and smoke tests

## Test Configuration

### Frontend (Vitest)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### Backend (Jest)
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "collectCoverageFrom": ["src/**/*.ts"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### E2E (Playwright)
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

## Test Data Management

### Fixtures
```typescript
// tests/fixtures/projects.ts
export const mockProjects = [
  {
    id: '1',
    title: 'Project Uriel',
    description: 'Personal portfolio',
    technologies: ['React', 'Firebase', 'TypeScript']
  }
]
```

### Test Utilities
```typescript
// tests/utils/testing.ts
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <FirebaseProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </FirebaseProvider>
    )
  })
}
```

## Performance Testing

### Frontend Performance
```bash
# Bundle analysis
analyze

# Lighthouse audit
lighthouse

# Core Web Vitals
npm run test:performance
```

### Backend Performance
```typescript
// Load testing example
describe('API Performance', () => {
  it('handles 100 concurrent requests', async () => {
    const requests = Array(100).fill().map(() => 
      fetch('/api/projects')
    )
    
    const responses = await Promise.all(requests)
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
  })
})
```

## Security Testing

### Firebase Rules Testing
```javascript
// firestore.rules.test.js
describe('Firestore Security Rules', () => {
  it('denies unauthorized access to projects', async () => {
    const db = getFirestore(getTestApp())
    
    await firebase.assertFails(
      db.collection('projects').doc('test').get()
    )
  })
})
```

### API Security
```bash
# OWASP ZAP scanning
npm run security:scan

# Dependency vulnerability check
npm audit

# Secret scanning
git secrets --scan
```

## Deployment Testing Workflow

### 1. Pre-deployment Validation
```bash
# Validate deployment scripts
test:deployment

# Ensure all tests pass
test:all

# Check build works
build
```

### 2. Staging Deployment
```bash
# Deploy to staging
deploy:staging

# Verify staging health
test:staging
```

### 3. Production Deployment
```bash
# Deploy to production (with confirmations)
deploy:prod

# Immediate smoke test
test:production

# Monitor for 30 minutes
monitor
```

## Best Practices

### 1. Test Organization
- Keep tests close to source code
- Use descriptive test names
- Group related tests with `describe` blocks
- One assertion per test when possible

### 2. Test Quality
- Aim for 80%+ code coverage
- Test edge cases and error conditions
- Use realistic test data
- Avoid testing implementation details

### 3. Performance
- Keep unit tests fast (< 1s each)
- Use parallel execution
- Mock external dependencies
- Run E2E tests selectively

### 4. Maintenance
- Update tests when features change
- Remove obsolete tests
- Keep test dependencies updated
- Document complex test scenarios

## Debugging Tests

### Frontend
```bash
# Debug mode
npm run test:debug

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Backend
```bash
# Debug with inspector
npm run test:debug

# Verbose output
npm run test:verbose
```

### E2E
```bash
# Debug mode with browser
npm run test:e2e:debug

# Record test runs
npm run test:e2e:record
```

## Troubleshooting

### Common Issues

#### Tests Timing Out
```bash
# Increase timeout
test --timeout=30000

# Check for memory leaks
npm run test:memory
```

#### Firebase Emulator Issues
```bash
# Reset emulator data
clean:docker
up

# Check emulator ports
ps
```

#### Environment Issues
```bash
# Check environment variables
env | grep VITE_

# Reload environment
source activate
```

## Test Metrics

We track these key metrics:
- **Coverage**: >80% for all services
- **Performance**: Unit tests <1s, E2E <5min
- **Reliability**: <5% flaky test rate
- **Feedback Time**: Full suite <10min

## Future Enhancements

Planned testing improvements:
- Visual regression testing
- A/B testing framework
- Performance monitoring
- Chaos engineering
- Mobile testing automation

## Testing Patterns from PU-8 Implementation

### Distributed Test Structure Benefits

The project uses a distributed testing approach where tests live alongside their source code:

```
services/backend/functions/
├── src/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── __tests__/
│   │       └── auth.test.ts
│   └── utils/
│       ├── validation.ts
│       └── __tests__/
│           └── validation.test.ts
```

**Benefits:**
- Tests are easier to find and maintain
- Refactoring is simpler when tests move with code
- Clear ownership and locality of tests
- Better IDE integration and navigation

### Firebase Admin SDK Testing Patterns

When testing Firebase Admin SDK functionality:

```typescript
// Mock Firebase Admin at the module level
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn()
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn()
  }))
}));

// Import after mocking
import * as admin from 'firebase-admin';
```

### Express Middleware Testing

Comprehensive pattern for testing Express middleware:

```typescript
describe('Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    mockNext = jest.fn();
  });

  // Test successful path
  // Test error conditions
  // Test edge cases
});
```

## Important Reminders

1. **Always run tests before pushing** - Use git hooks
2. **Test deployment scripts safely** - Use `test:deployment`
3. **Verify staging before production** - Use `test:staging`
4. **Monitor production after deployment** - Use `test:production`
5. **Keep tests fast and reliable** - Optimize regularly
6. **Document complex test scenarios** - Update this MEMORY.md
7. **Use distributed test structure** - Keep tests with their source code
8. **Mock Firebase Admin properly** - Mock at module level before imports

Remember: Good tests are our safety net for confident deployments! 🛡️