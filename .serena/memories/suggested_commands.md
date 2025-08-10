# Essential Commands for Portfolio Website Development

## Firebase Development Commands

### Local Development & Emulators
```bash
# Start all Firebase emulators
firebase emulators:start

# Start specific emulators only
firebase emulators:start --only firestore,auth,functions,storage

# Start emulators with specific ports
firebase emulators:start --only functions --functions-port=5001
```

### Firebase Functions
```bash
# Install dependencies in functions directory
cd functions && npm install

# Build functions
cd functions && npm run build

# Deploy functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendContactEmail

# View function logs
firebase functions:log
firebase functions:log --only sendContactEmail

# Test functions locally
cd functions && npm run serve
```

### Firestore Operations
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Delete collection (careful!)
firebase firestore:delete --recursive collections/analytics

# Export data
firebase firestore:export gs://your-bucket/exports/

# Import data
firebase firestore:import gs://your-bucket/exports/
```

### Authentication & Security
```bash
# Deploy security rules
firebase deploy --only firestore:rules,storage

# Test security rules
firebase emulators:exec --only firestore "npm test"
```

### Configuration Management
```bash
# Set function environment variables
firebase functions:config:set email.user="admin@yourdomain.com"
firebase functions:config:set email.pass="app-password"

# Get current config
firebase functions:config:get

# Deploy with config
firebase deploy --only functions
```

### Storage Operations
```bash
# Deploy storage rules
firebase deploy --only storage

# List files in storage
firebase storage:list gs://your-bucket/resumes/
```

## Node.js/TypeScript Commands

### Functions Development
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Run TypeScript compiler
npm run build

# Run with file watching
npm run build:watch

# Run tests
npm test

# Lint code
npm run lint
```

### Package Management
```bash
# Add new dependency
npm install package-name

# Add dev dependency
npm install --save-dev @types/package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated
```

## Git Operations (Darwin/macOS)

### Standard Git Commands
```bash
# Status and basic operations
git status
git add .
git commit -m "feat: implement contact form function"
git push origin main

# Branch management
git checkout -b feature/analytics-dashboard
git merge feature/analytics-dashboard
git branch -d feature/analytics-dashboard

# Remote operations
git remote -v
git pull origin main
```

### Useful Git Aliases (add to ~/.gitconfig)
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
```

## macOS System Commands

### File Operations
```bash
# List files (macOS)
ls -la
ls -R  # recursive

# Find files
find . -name "*.ts" -type f
find . -name "firebase.json"

# Search in files
grep -r "apiKey" .
grep -r "sendContactEmail" ./functions/

# File permissions
chmod 755 script.sh
chmod 644 config.json
```

### Process Management
```bash
# Find processes by port
lsof -i :5000
lsof -i :8080

# Kill process by PID
kill -9 <PID>

# System information
sw_vers  # macOS version
uname -a  # system info
```

## Firebase MCP Commands (Claude Code Integration)

### Project Management
```bash
# Get current project info
firebase_get_project

# List all projects
firebase_list_projects

# Switch project
firebase use project-id
```

### Firestore Operations via MCP
- `firestore_get_documents` - Retrieve documents
- `firestore_query_collection` - Query collections with filters
- `firestore_delete_document` - Remove documents
- `firestore_get_rules` - Get current security rules
- `firestore_validate_rules` - Test rule syntax

### Authentication via MCP  
- `auth_get_user` - Get user by email/UID
- `auth_list_users` - List all users
- `auth_set_claim` - Set custom claims
- `auth_disable_user` - Enable/disable users

### Functions via MCP
- Function deployment through MCP tools
- Log viewing and debugging
- Environment configuration

## Testing Commands

### Firebase Emulator Testing
```bash
# Run tests against emulators
npm test -- --testEnvironment=emulator

# Test specific function
npm test -- --grep="sendContactEmail"

# Run security rules tests
npm run test:rules
```

### TypeScript Type Checking
```bash
# Check types in functions
cd functions && npx tsc --noEmit

# Watch mode for type checking
cd functions && npx tsc --noEmit --watch
```

## Deployment Commands

### Production Deployment
```bash
# Full deployment
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore,storage

# Deploy with confirmation
firebase deploy --confirm
```

### Environment-Specific Deployment
```bash
# Deploy to staging
firebase use staging && firebase deploy

# Deploy to production
firebase use production && firebase deploy
```

## Monitoring & Debugging

### Log Viewing
```bash
# Function logs
firebase functions:log --lines=50

# Real-time logs
firebase functions:log --follow

# Specific function logs
firebase functions:log --only sendContactEmail
```

### Performance Monitoring
```bash
# Firebase console URL
open https://console.firebase.google.com/project/your-project-id

# Local emulator UI
open http://localhost:4000
```