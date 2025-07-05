# Scripts Memory

This document provides guidance for using and maintaining developer productivity scripts in Project Uriel.

## Overview

The scripts directory contains developer commands that enhance productivity by providing easy-to-use shortcuts for common tasks. These commands are inspired by the Hermes project's excellent developer experience.

## Important: Always Use These Commands!

**REMINDER**: After running `source activate` or using direnv, you have access to powerful commands that simplify development. Always use these commands instead of manual Docker or Firebase commands.

## Available Commands

### Environment Management
```bash
# Start all services (Docker containers + Firebase emulators)
up

# Stop all services
down

# Restart all services
restart

# View status of all services
ps

# View logs (all services or specific)
logs          # All logs
logs frontend # Frontend logs only
logs firebase # Firebase emulator logs only
```

### Development Commands
```bash
# Run development server (frontend with hot reload)
dev

# Run tests
test          # Run all tests
test:frontend # Frontend tests only
test:backend  # Backend tests only
test:e2e      # End-to-end tests

# Code quality
lint          # Run linting
format        # Format code with Prettier
type-check    # TypeScript type checking
```

### Firebase Commands
```bash
# Firebase emulator management
emulators         # Start emulators
emulators:export  # Export emulator data
emulators:import  # Import emulator data

# Deploy commands
deploy:staging    # Deploy to staging
deploy:prod       # Deploy to production (requires confirmation)

# Firebase specific
functions:shell   # Firebase functions shell
firestore:backup  # Backup Firestore data
```

### Build Commands
```bash
# Build project
build         # Build all services
build:frontend # Build frontend only
build:backend  # Build backend only

# Rebuild (clean build)
rebuild       # Rebuild all
rebuild:frontend
rebuild:backend
```

### Utility Commands
```bash
# Clean up
clean         # Clean build artifacts
clean:docker  # Clean Docker volumes
nuke          # Complete cleanup (requires confirmation)

# Database access
db:seed       # Seed development data
db:reset      # Reset database

# Monitoring
monitor       # Open monitoring dashboard
analyze       # Analyze bundle size
lighthouse    # Run Lighthouse audit
```

## Commands Implementation

### Main Commands Script
```bash
#!/usr/bin/env bash
# scripts/commands.sh

# Source environment variables
source .env.local 2>/dev/null || true

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Environment commands
up() {
    log_info "Starting all services..."
    docker-compose -f infra/local/docker-compose.yml up -d
    log_info "Services started! Frontend: http://localhost:5173, Firebase UI: http://localhost:4000"
}

down() {
    log_info "Stopping all services..."
    docker-compose -f infra/local/docker-compose.yml down
    log_info "All services stopped."
}

restart() {
    down
    up
}

ps() {
    docker-compose -f infra/local/docker-compose.yml ps
}

logs() {
    if [ -z "$1" ]; then
        docker-compose -f infra/local/docker-compose.yml logs -f
    else
        docker-compose -f infra/local/docker-compose.yml logs -f "$1"
    fi
}

# Development commands
dev() {
    log_info "Starting development server..."
    cd services/frontend/webapp && npm run dev
}

test() {
    log_info "Running all tests..."
    test:frontend
    test:backend
}

test:frontend() {
    log_info "Running frontend tests..."
    cd services/frontend/webapp && npm test
}

test:backend() {
    log_info "Running backend tests..."
    cd services/backend/functions && npm test
}

test:e2e() {
    log_info "Running E2E tests..."
    cd services/frontend/webapp && npm run test:e2e
}

# Code quality
lint() {
    log_info "Running linters..."
    cd services/frontend/webapp && npm run lint
    cd ../../../services/backend/functions && npm run lint
}

format() {
    log_info "Formatting code..."
    cd services/frontend/webapp && npm run format
    cd ../../../services/backend/functions && npm run format
}

type-check() {
    log_info "Checking TypeScript types..."
    cd services/frontend/webapp && npm run type-check
    cd ../../../services/backend/functions && npm run type-check
}

# Firebase commands
emulators() {
    log_info "Starting Firebase emulators..."
    cd infra/local && firebase emulators:start
}

emulators:export() {
    log_info "Exporting emulator data..."
    cd infra/local && firebase emulators:export ./.firebase-export
}

emulators:import() {
    log_info "Importing emulator data..."
    cd infra/local && firebase emulators:start --import ./.firebase-export
}

deploy:staging() {
    log_warn "Deploying to STAGING environment..."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd infra/staging && ./deploy.sh
    else
        log_info "Deployment cancelled."
    fi
}

deploy:prod() {
    log_error "Deploying to PRODUCTION environment..."
    read -p "Are you REALLY sure? Type 'deploy production' to confirm: " confirmation
    if [[ "$confirmation" == "deploy production" ]]; then
        cd infra/prod && ./deploy.sh
    else
        log_info "Production deployment cancelled."
    fi
}

# Build commands
build() {
    log_info "Building all services..."
    build:frontend
    build:backend
}

build:frontend() {
    log_info "Building frontend..."
    cd services/frontend/webapp && npm run build
}

build:backend() {
    log_info "Building backend functions..."
    cd services/backend/functions && npm run build
}

rebuild() {
    clean
    build
}

# Cleanup commands
clean() {
    log_info "Cleaning build artifacts..."
    rm -rf services/frontend/webapp/dist
    rm -rf services/frontend/webapp/node_modules/.cache
    rm -rf services/backend/functions/lib
}

clean:docker() {
    log_warn "Cleaning Docker volumes..."
    docker-compose -f infra/local/docker-compose.yml down -v
}

nuke() {
    log_error "This will remove ALL build artifacts, Docker volumes, and node_modules!"
    read -p "Are you sure? Type 'nuke everything' to confirm: " confirmation
    if [[ "$confirmation" == "nuke everything" ]]; then
        clean
        clean:docker
        find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
        log_info "Everything has been nuked. Run 'setup.sh' to start fresh."
    else
        log_info "Nuke cancelled."
    fi
}

# Database commands
db:seed() {
    log_info "Seeding development database..."
    cd services/backend && npm run seed
}

db:reset() {
    log_warn "Resetting database..."
    clean:docker
    up
    sleep 5
    db:seed
}

# Monitoring commands
monitor() {
    log_info "Opening monitoring dashboards..."
    open http://localhost:4000  # Firebase Emulator UI
    open http://localhost:5173  # Frontend
}

analyze() {
    log_info "Analyzing bundle size..."
    cd services/frontend/webapp && npm run build -- --analyze
}

lighthouse() {
    log_info "Running Lighthouse audit..."
    cd services/frontend/webapp && npm run lighthouse
}

# Help command
commands() {
    echo "Available commands:"
    echo ""
    echo "Environment Management:"
    echo "  up              - Start all services"
    echo "  down            - Stop all services"
    echo "  restart         - Restart all services"
    echo "  ps              - Show service status"
    echo "  logs [service]  - View logs"
    echo ""
    echo "Development:"
    echo "  dev             - Start dev server"
    echo "  test            - Run all tests"
    echo "  test:frontend   - Run frontend tests"
    echo "  test:backend    - Run backend tests"
    echo "  test:e2e        - Run E2E tests"
    echo ""
    echo "Code Quality:"
    echo "  lint            - Run linters"
    echo "  format          - Format code"
    echo "  type-check      - Check TypeScript"
    echo ""
    echo "Firebase:"
    echo "  emulators       - Start emulators"
    echo "  deploy:staging  - Deploy to staging"
    echo "  deploy:prod     - Deploy to production"
    echo ""
    echo "Build:"
    echo "  build           - Build all"
    echo "  rebuild         - Clean and build"
    echo ""
    echo "Utilities:"
    echo "  clean           - Clean artifacts"
    echo "  nuke            - Remove everything"
    echo "  monitor         - Open dashboards"
    echo "  analyze         - Bundle analysis"
}

# Export all functions
export -f up down restart ps logs dev test test:frontend test:backend
export -f test:e2e lint format type-check emulators emulators:export
export -f emulators:import deploy:staging deploy:prod build build:frontend
export -f build:backend rebuild clean clean:docker nuke db:seed db:reset
export -f monitor analyze lighthouse commands log_info log_warn log_error
```

## Setup and Activation

### Using direnv (Recommended)
```bash
# .envrc file in project root
source scripts/commands.sh
echo "🚀 Project Uriel commands loaded! Type 'commands' for help."
```

### Manual Activation
```bash
# activate file in project root
#!/usr/bin/env bash
source scripts/commands.sh
echo "🚀 Project Uriel commands loaded! Type 'commands' for help."
```

### Initial Setup Script
The `setup.sh` script should:
1. Check dependencies
2. Install required tools
3. Set up git hooks
4. Initialize Firebase
5. Create .env.local from template
6. Install npm dependencies
7. Build initial containers
8. Seed development data

## Best Practices

### 1. Always Use Commands
- ❌ Don't: `docker-compose up -d`
- ✅ Do: `up`

- ❌ Don't: `cd services/frontend/webapp && npm test`
- ✅ Do: `test:frontend`

### 2. Command Naming Convention
- Use colons for namespacing: `test:frontend`, `build:backend`
- Keep names short and memorable
- Use verbs for actions: `build`, `deploy`, `clean`

### 3. Safety Features
- Destructive commands require confirmation
- Production deployments require typed confirmation
- Color-coded output for clarity
- Helpful error messages

### 4. Extensibility
Add new commands by:
1. Define function in commands.sh
2. Export the function
3. Document in help command
4. Update this MEMORY.md

## Common Workflows

### Daily Development
```bash
# Start your day
up
dev

# Run tests before committing
test
lint

# Check your work
logs frontend
```

### Before Creating PR
```bash
# Full quality check
lint
format
type-check
test
build
```

### Debugging Issues
```bash
# Check service status
ps

# View specific logs
logs firebase

# Reset if needed
down
clean:docker
up
```

### Deployment
```bash
# Deploy to staging
build
test
deploy:staging

# Deploy to production (after staging verified)
deploy:prod
```

## Troubleshooting

### Command Not Found
```bash
# Re-source the commands
source activate
# or
direnv allow
```

### Port Already in Use
```bash
# Find and kill the process
lsof -i :5173  # or other port
kill -9 <PID>
```

### Docker Issues
```bash
# Reset Docker environment
down
clean:docker
docker system prune -a  # Use with caution!
up
```

## Important Reminders

1. **ALWAYS use these commands** instead of manual Docker/npm commands
2. **Run `source activate`** when starting work
3. **Check `commands`** if you forget available commands
4. **Use `logs`** to debug issues
5. **Run tests** before committing
6. **Use confirmation prompts** for safety

## Future Enhancements

Consider adding:
- `backup` - Backup production data
- `migrate` - Run database migrations
- `profile` - Performance profiling
- `security` - Security audit
- `update` - Update dependencies
- `version` - Bump version numbers

Remember: These commands are here to make your life easier. Use them!