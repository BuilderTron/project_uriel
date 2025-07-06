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
    echo "  emulators       - Start emulators"
    echo "  deploy:staging  - Deploy to staging"
    echo "  deploy:prod     - Deploy to production"
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
export -f up down restart ps logs dev test test:frontend test:backend
export -f test:e2e lint format type-check emulators emulators:export
export -f emulators:import deploy:staging deploy:prod build build:frontend
export -f build:backend rebuild rebuild:docker clean clean:docker nuke db:seed db:reset
export -f monitor analyze lighthouse commands log_info log_warn log_error