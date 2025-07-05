# Infrastructure Memory

This document provides guidance for managing infrastructure, environments, and deployment strategies for Project Uriel.

## Overview

The infrastructure follows a multi-environment strategy with containerized local development using Docker and Firebase Emulator Suite, with deployment to Firebase Hosting/App Hosting through GitHub Actions CI/CD pipelines.

## Environment Structure

```
infra/
├── local/                  # Local development configuration
│   ├── docker-compose.yml  # Docker services orchestration
│   ├── Dockerfile.firebase # Firebase emulator image
│   ├── firebase.json       # Firebase emulator configuration
│   ├── .firebaserc         # Firebase project aliases
│   └── .env.example        # Environment template
├── dev/                    # Development environment
│   ├── firebase.json       # Dev Firebase config
│   ├── .firebaserc         # Dev project config
│   └── deploy.sh           # Dev deployment script
├── staging/                # Staging environment
│   ├── firebase.json       # Staging Firebase config
│   ├── .firebaserc         # Staging project config
│   └── deploy.sh           # Staging deployment script
├── prod/                   # Production environment
│   ├── firebase.json       # Prod Firebase config
│   ├── .firebaserc         # Prod project config
│   └── deploy.sh           # Production deployment script
└── shared/                 # Shared configurations
    ├── security-headers.json
    └── cors-config.json
```

## Local Development Environment

### Docker Compose Configuration

```yaml
# infra/local/docker-compose.yml
version: '3.9'

services:
  firebase-emulators:
    build:
      context: .
      dockerfile: Dockerfile.firebase
    container_name: uriel-firebase-emulators
    ports:
      - "4000:4000"  # Emulator UI
      - "5001:5001"  # Functions
      - "8080:8080"  # Firestore
      - "9099:9099"  # Auth
      - "9199:9199"  # Storage
      - "9299:9299"  # Eventarc
    volumes:
      - ../../services/backend:/app/backend
      - firebase-data:/app/.firebase
    environment:
      - FIREBASE_PROJECT=${FIREBASE_PROJECT_ID:-project-uriel-local}
      - GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
    networks:
      - uriel-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: node:18-alpine
    container_name: uriel-frontend
    working_dir: /app
    ports:
      - "5173:5173"
    volumes:
      - ../../services/frontend/webapp:/app
      - /app/node_modules
    environment:
      - VITE_FIREBASE_EMULATOR_HOST=firebase-emulators
      - VITE_USE_EMULATORS=true
    command: sh -c "npm install && npm run dev -- --host"
    networks:
      - uriel-network
    depends_on:
      firebase-emulators:
        condition: service_healthy

networks:
  uriel-network:
    driver: bridge

volumes:
  firebase-data:
```

### Firebase Emulator Dockerfile

```dockerfile
# infra/local/Dockerfile.firebase
FROM node:18-alpine

# Install Java for Firebase emulators
RUN apk add --no-cache openjdk11-jre bash curl

# Install Firebase tools
RUN npm install -g firebase-tools@latest

# Create app directory
WORKDIR /app

# Copy Firebase configuration
COPY firebase.json .firebaserc ./

# Copy backend services
COPY ../../services/backend ./backend

# Install Cloud Functions dependencies
WORKDIR /app/backend/functions
RUN npm install

WORKDIR /app

# Expose emulator ports
EXPOSE 4000 5001 8080 9099 9199 9299

# Start emulators
CMD ["firebase", "emulators:start", "--import=./.firebase", "--export-on-exit"]
```

### Firebase Configuration

```json
// infra/local/firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099,
      "host": "0.0.0.0"
    },
    "functions": {
      "port": 5001,
      "host": "0.0.0.0"
    },
    "firestore": {
      "port": 8080,
      "host": "0.0.0.0"
    },
    "storage": {
      "port": 9199,
      "host": "0.0.0.0"
    },
    "ui": {
      "enabled": true,
      "port": 4000,
      "host": "0.0.0.0"
    },
    "singleProjectMode": true
  },
  "firestore": {
    "rules": "../../services/backend/firestore/firestore.rules",
    "indexes": "../../services/backend/firestore/firestore.indexes.json"
  },
  "functions": {
    "source": "../../services/backend/functions",
    "runtime": "nodejs18",
    "ignore": [
      "node_modules",
      ".git",
      "**/*.log"
    ]
  },
  "storage": {
    "rules": "../../services/backend/storage/storage.rules"
  }
}
```

## Environment-Specific Configurations

### Development Environment

```json
// infra/dev/firebase.json
{
  "hosting": {
    "public": "../../services/frontend/webapp/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|jpg|jpeg|gif|png|svg|webp|avif)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Staging Environment

```json
// infra/staging/firebase.json
{
  "hosting": {
    "site": "project-uriel-staging",
    "public": "../../services/frontend/webapp/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "../../services/backend/functions",
    "runtime": "nodejs18",
    "environmentVariables": {
      "ENVIRONMENT": "staging"
    }
  }
}
```

### Production Environment

```json
// infra/prod/firebase.json
{
  "hosting": {
    "site": "project-uriel",
    "public": "../../services/frontend/webapp/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), microphone=(), camera=()"
          }
        ]
      }
    ]
  }
}
```

## GitHub Actions CI/CD

### Workflow Structure

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches:
      - develop  # Triggers staging deployment
      - main     # Triggers production deployment
  pull_request:
    types: [opened, synchronize, reopened]

env:
  NODE_VERSION: '18'
  FIREBASE_CLI_VERSION: 'latest'

jobs:
  # Continuous Integration
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci --prefix services/frontend/webapp
          npm ci --prefix services/backend/functions
      
      - name: Run linting
        run: |
          npm run lint --prefix services/frontend/webapp
          npm run lint --prefix services/backend/functions
      
      - name: Run type checking
        run: |
          npm run type-check --prefix services/frontend/webapp
          npm run type-check --prefix services/backend/functions
      
      - name: Run tests
        run: |
          npm test --prefix services/frontend/webapp
          npm test --prefix services/backend/functions
      
      - name: Build frontend
        run: npm run build --prefix services/frontend/webapp
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: services/frontend/webapp/dist

  # Deploy to Staging
  deploy-staging:
    needs: ci
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: services/frontend/webapp/dist
      
      - name: Deploy to Firebase Staging
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --project staging
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
          PROJECT_PATH: ./infra/staging

  # Deploy to Production
  deploy-production:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: services/frontend/webapp/dist
      
      - name: Deploy to Firebase Production
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --project production
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
          PROJECT_PATH: ./infra/prod
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false
```

## Branch Strategy (from Hermes)

### Branch Types
- `main` - Production branch (protected)
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes
- `release/*` - Release preparation

### Deployment Mapping
- `develop` → Staging environment
- `main` → Production environment
- Pull requests → Preview deployments

## Security Considerations

### Environment Variables Management
```yaml
# GitHub Secrets Required:
# - FIREBASE_TOKEN (CI service account)
# - FIREBASE_API_KEY_STAGING
# - FIREBASE_API_KEY_PROD
# - SENTRY_DSN
# - SENDGRID_API_KEY
```

### Firebase Security
1. **Service Accounts**: Separate accounts per environment
2. **API Key Restrictions**: Domain-based restrictions
3. **CORS Configuration**: Whitelist allowed origins
4. **Rate Limiting**: Implement on Cloud Functions
5. **Security Headers**: Configured in hosting

## Monitoring and Alerts

### Performance Monitoring
```javascript
// Automatically enabled in production
{
  "performance": {
    "enabled": true,
    "tracesSampleRate": 0.1
  }
}
```

### Error Tracking
- Sentry integration for production
- Firebase Crashlytics for mobile (future)
- Custom error logging in Cloud Functions

## Cost Optimization

### Firebase Usage Limits
1. **Firestore**: Monitor read/write operations
2. **Cloud Functions**: Optimize cold starts
3. **Storage**: Implement lifecycle rules
4. **Hosting**: Use CDN effectively

### Budget Alerts
```yaml
# Set up in Google Cloud Console
- Firestore reads > 50k/day
- Cloud Functions invocations > 100k/month
- Storage bandwidth > 10GB/month
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Lighthouse score >95
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Database migrations ready

### Post-deployment
- [ ] Verify deployment success
- [ ] Check error logs
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Update status page

## Rollback Procedures

### Quick Rollback
```bash
# List recent releases
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

### Database Rollback
- Use Firestore backups
- Implement versioned data migrations
- Test rollback procedures regularly

## Local Development Commands

After setting up the infrastructure, these commands will be available:

```bash
# Start local environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Clean everything
docker-compose down -v

# Deploy to staging
./infra/staging/deploy.sh

# Deploy to production (requires approval)
./infra/prod/deploy.sh
```

## Important Notes

1. **Always use context7** for Firebase best practices
2. **Never commit secrets** to the repository
3. **Test locally first** with emulators
4. **Use preview deployments** for PRs
5. **Monitor costs** regularly
6. **Keep dependencies updated**
7. **Document infrastructure changes**

## References
- [Firebase Documentation](https://firebase.google.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Context7 for latest patterns and best practices