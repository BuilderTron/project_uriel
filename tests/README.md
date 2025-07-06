# Project Uriel Test Suite

This directory contains all tests for Project Uriel, organized by domain.

## Test Structure

```
tests/
├── README.md
├── unit/              # Unit tests (run locally)
│   ├── frontend/      # Frontend component tests
│   └── backend/       # Backend function tests
├── integration/       # Integration tests
│   ├── api/          # API endpoint tests
│   └── firebase/     # Firebase rules tests
├── e2e/              # End-to-end tests
│   └── playwright/   # Playwright test suites
├── deployment/       # Deployment verification
│   ├── staging/      # Staging deployment tests
│   └── production/   # Production smoke tests
└── scripts/          # Test utilities
    └── run-all.sh    # Run all test suites
```

## Running Tests

### All Tests
```bash
# From project root
npm test

# Or use our command
test
```

### Specific Test Suites
```bash
# Unit tests only
test:unit

# Integration tests
test:integration

# E2E tests
test:e2e

# Deployment tests
test:deployment
```

### Deployment Testing
```bash
# Test deployment scripts without deploying
./tests/deployment/test-deploy-scripts.sh

# Verify staging deployment
./tests/deployment/staging/verify.sh

# Production smoke tests (after deployment)
./tests/deployment/production/smoke-test.sh
```

## Test Strategy

1. **Unit Tests**: Fast, isolated tests for individual components/functions
2. **Integration Tests**: Test interactions between services
3. **E2E Tests**: Full user journey testing
4. **Deployment Tests**: Verify deployment readiness and health

## CI/CD Integration

All tests run automatically:
- Unit & Integration: On every push
- E2E: On pull requests
- Deployment: Before and after deployments