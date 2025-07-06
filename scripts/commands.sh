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
    docker compose -f infra/local/docker-compose.yml up -d
    log_info "Services started! Frontend: http://localhost:5173, Firebase UI: http://localhost:4000"
}

down() {
    log_info "Stopping all services..."
    docker compose -f infra/local/docker-compose.yml down
    log_info "All services stopped."
}

restart() {
    down
    up
}

ps() {
    docker compose -f infra/local/docker-compose.yml ps
}

logs() {
    if [ -z "$1" ]; then
        docker compose -f infra/local/docker-compose.yml logs -f
    else
        docker compose -f infra/local/docker-compose.yml logs -f "$1"
    fi
}

# Development commands
dev() {
    log_info "Starting development server..."
    cd services/frontend/webapp && npm run dev
}

test() {
    log_info "Running all tests..."
    ./tests/scripts/run-all.sh
}

test:all() {
    log_info "Running full test suite..."
    ./tests/scripts/run-all.sh
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

test:deployment() {
    log_info "Testing deployment scripts..."
    ./tests/deployment/test-deploy-scripts.sh
}

test:staging() {
    log_info "Verifying staging deployment..."
    ./tests/deployment/staging/verify.sh
}

test:production() {
    log_info "Running production smoke tests..."
    ./tests/deployment/production/smoke-test.sh
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

# Firebase validation commands
firebase:validate-rules() {
    log_info "Validating Firebase security rules..."
    cd services/backend
    
    # Check if Firestore rules exist
    if [[ -f "firestore/firestore.rules" ]]; then
        log_info "Testing Firestore security rules..."
        if firebase emulators:exec --only firestore "npm run test:rules" 2>/dev/null; then
            log_info "✅ Firestore rules validation passed"
        else
            log_error "❌ Firestore rules validation failed"
            log_error "Run 'cd services/backend && firebase emulators:start' to debug"
            cd ../..
            return 1
        fi
    fi
    
    # Check if Storage rules exist
    if [[ -f "storage/storage.rules" ]]; then
        log_info "Validating Storage security rules..."
        if firebase deploy --only storage:rules --dry-run > /dev/null 2>&1; then
            log_info "✅ Storage rules validation passed"
        else
            log_error "❌ Storage rules validation failed"
            cd ../..
            return 1
        fi
    fi
    
    cd ../..
    log_info "🎉 All Firebase rules validated successfully"
}

firebase:lint-functions() {
    log_info "Linting Cloud Functions..."
    cd services/backend/functions
    
    # TypeScript compilation
    log_info "Checking TypeScript compilation..."
    if ! npm run build > /dev/null 2>&1; then
        log_error "❌ TypeScript compilation failed"
        log_error "Run 'cd services/backend/functions && npm run build' for details"
        cd ../../..
        return 1
    fi
    
    # ESLint
    log_info "Running ESLint..."
    if ! npm run lint; then
        log_error "❌ ESLint validation failed"
        log_error "Run 'cd services/backend/functions && npm run lint -- --fix' to auto-fix"
        cd ../../..
        return 1
    fi
    
    cd ../../..
    log_info "✅ Cloud Functions linting passed"
}

firebase:test-functions() {
    log_info "Testing Cloud Functions..."
    cd services/backend/functions
    
    if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
        if npm test; then
            log_info "✅ Cloud Functions tests passed"
        else
            log_error "❌ Cloud Functions tests failed"
            cd ../../..
            return 1
        fi
    else
        log_warn "No Cloud Functions tests found"
    fi
    
    cd ../../..
}

firebase:check-config() {
    log_info "Validating Firebase configuration files..."
    
    # firebase.json
    if [[ -f "firebase.json" ]]; then
        if python3 -m json.tool firebase.json > /dev/null 2>&1; then
            log_info "✅ firebase.json syntax valid"
        else
            log_error "❌ firebase.json has invalid JSON syntax"
            return 1
        fi
    fi
    
    # .firebaserc
    if [[ -f ".firebaserc" ]]; then
        if python3 -m json.tool .firebaserc > /dev/null 2>&1; then
            log_info "✅ .firebaserc syntax valid"
        else
            log_error "❌ .firebaserc has invalid JSON syntax"
            return 1
        fi
    fi
    
    # Firestore indexes
    if [[ -f "services/backend/firestore/firestore.indexes.json" ]]; then
        if python3 -m json.tool services/backend/firestore/firestore.indexes.json > /dev/null 2>&1; then
            log_info "✅ firestore.indexes.json syntax valid"
        else
            log_error "❌ firestore.indexes.json has invalid JSON syntax"
            return 1
        fi
    fi
    
    log_info "🎉 All Firebase configuration files validated"
}

firebase:validate-all() {
    log_info "Running complete Firebase validation..."
    firebase:check-config && \
    firebase:validate-rules && \
    firebase:lint-functions && \
    firebase:test-functions
    
    if [[ $? -eq 0 ]]; then
        log_info "🎉 All Firebase validations passed!"
    else
        log_error "❌ Firebase validation failed"
        return 1
    fi
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

# Docker rebuild command
rebuild:docker() {
    log_info "Rebuilding Docker containers..."
    docker compose -f infra/local/docker-compose.yml down
    docker compose -f infra/local/docker-compose.yml build --no-cache
    docker compose -f infra/local/docker-compose.yml up -d
    log_info "Docker containers rebuilt and started!"
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
    docker compose -f infra/local/docker-compose.yml down -v
}

nuke() {
    log_error "This will remove ALL Project Uriel build artifacts, Docker volumes, and node_modules!"
    echo -n "Are you sure? Type 'nuke everything' to confirm: "
    read confirmation
    if [[ "$confirmation" == "nuke everything" ]]; then
        clean
        clean:docker
        # Remove Project Uriel specific containers and volumes
        docker container rm -f uriel-firebase-emulators uriel-frontend 2>/dev/null || true
        docker volume rm uriel-firebase-data uriel-firebase-config uriel-frontend-node-modules 2>/dev/null || true
        docker network rm uriel-network 2>/dev/null || true
        # Remove node_modules only in this project directory
        find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
        log_info "Project Uriel has been nuked. Run 'setup.sh' to start fresh."
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
    echo "  emulators              - Start emulators"
    echo "  firebase:validate-all  - Run all Firebase validations"
    echo "  firebase:validate-rules- Validate security rules"
    echo "  firebase:lint-functions- Lint Cloud Functions"
    echo "  firebase:test-functions- Test Cloud Functions"
    echo "  firebase:check-config  - Validate Firebase config"
    echo "  deploy:staging         - Deploy to staging"
    echo "  deploy:prod            - Deploy to production"
    echo ""
    echo "Build:"
    echo "  build           - Build all"
    echo "  rebuild         - Clean and build"
    echo "  rebuild:docker  - Rebuild Docker containers"
    echo ""
    echo "Utilities:"
    echo "  clean           - Clean artifacts"
    echo "  nuke            - Remove everything"
    echo "  monitor         - Open dashboards"
    echo "  analyze         - Bundle analysis"
}

# Export all functions
export -f up down restart ps logs dev test test:all test:frontend test:backend
export -f test:e2e test:deployment test:staging test:production lint format type-check 
export -f emulators emulators:export emulators:import deploy:staging deploy:prod 
export -f firebase:validate-rules firebase:lint-functions firebase:test-functions firebase:check-config firebase:validate-all
export -f build build:frontend build:backend rebuild rebuild:docker clean clean:docker 
export -f nuke db:seed db:reset monitor analyze lighthouse commands 
export -f log_info log_warn log_error