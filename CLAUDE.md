# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Firebase-first portfolio website project with backend infrastructure as the primary focus. The architecture follows a serverless approach using Firebase services for all backend functionality.

### Core Firebase Structure
- **Functions**: Node.js/TypeScript Cloud Functions in `/functions/src/`
- **Firestore**: NoSQL database with collections for projects, resume, messages, analytics, settings, admins
- **Storage**: File storage for project images and resume PDFs
- **Authentication**: Google Sign-in with domain restriction for admin access
- **Hosting**: Static site hosting configuration

### Key Collections Schema
- `projects`: Portfolio project data with categories, technologies, and publish status
- `messages`: Contact form submissions with status tracking
- `analytics`: Custom analytics events for dashboard metrics
- `admins`: Domain-restricted admin users with role-based access
- `resume`: Structured resume data with PDF storage links
- `settings`: Site-wide configuration and SEO settings

## Development Commands

### Local Development
```bash
# Start all Firebase emulators
firebase emulators:start

# Start specific emulators only
firebase emulators:start --only firestore,auth,functions,storage

# Build and serve functions locally
cd functions && npm run serve
```

### Functions Development
```bash
# Navigate to functions and install dependencies
cd functions && npm install

# Build TypeScript
npm run build

# Deploy functions only
firebase deploy --only functions

# View function logs
firebase functions:log
```

### Database and Rules
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy storage rules
firebase deploy --only storage

# Test security rules locally
firebase emulators:exec --only firestore "npm test"
```

### Configuration Management
```bash
# Set function environment variables
firebase functions:config:set email.user="admin@domain.com"
firebase functions:config:set email.pass="app-password"

# Get current config
firebase functions:config:get
```

## Firebase Emulator Ports
- Auth: 9099
- Functions: 5001
- Firestore: 8080
- Hosting: 5000
- Storage: 9199
- UI: Default (4000)

## Security Model

### Domain Restriction
Admin access is restricted to specific Google Workspace domains. The `admins` collection maintains authorized users with role-based permissions.

### Firestore Security Rules
- Public read access for published projects, resume, and settings
- Admin-only write access across all collections
- Helper function `isAdmin()` validates domain-restricted authentication

### Storage Security Rules
- Public read access for uploaded files
- Admin-only upload permissions
- File type validation handled server-side in Cloud Functions

## TypeScript Configuration

The project uses TypeScript throughout with Node.js 18 runtime for functions. Main entry point is `functions/lib/index.js` after compilation from `functions/src/`.

## Author Attribution

All commits should be attributed to Jose J Lopez <JL@josejlopez.com>. Use conventional commit format with proper co-authoring when Claude assists with implementation.

## MCP Integration

This project includes Firebase MCP tools for Claude Code integration. Use Firebase MCP functions for database operations, authentication management, and rule validation during development.