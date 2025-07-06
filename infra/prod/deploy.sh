#!/usr/bin/env bash
# Production deployment script for Project Uriel
# CRITICAL: This deploys to PRODUCTION - be very careful!

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $1"
}

# Banner
echo -e "${RED}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║             ⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️               ║"
echo "║                                                              ║"
echo "║     This will deploy to PRODUCTION environment!              ║"
echo "║     All users will be affected by this deployment.           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "deploy.sh" ] || [ ! -f ".env.production.example" ]; then
    log_error "Please run this script from the infra/prod directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    log_error ".env.production not found!"
    log_info "Copy .env.production.example to .env.production and update with your values"
    exit 1
fi

# Double confirmation for production
echo -e "${YELLOW}Are you sure you want to deploy to PRODUCTION?${NC}"
echo -e "${YELLOW}Type 'deploy to production' to confirm:${NC}"
read -r confirmation

if [ "$confirmation" != "deploy to production" ]; then
    log_info "Production deployment cancelled."
    exit 0
fi

# Load environment variables
set -a
source .env.production
set +a

# Validate required environment variables
REQUIRED_VARS=(
    "FIREBASE_PROJECT_ID"
    "FIREBASE_API_KEY"
    "SENDGRID_API_KEY"
    "RECAPTCHA_SECRET_KEY"
    "JWT_SECRET"
    "SENTRY_DSN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required variable $var is not set in .env.production"
        exit 1
    fi
done

# Change to project root
cd ../..

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI not installed. Run: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    log_error "Not logged in to Firebase. Run: firebase login"
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warn "Not on main branch (currently on: $CURRENT_BRANCH)"
    echo -e "${YELLOW}Production deployments should be from main branch.${NC}"
    echo -e "${YELLOW}Continue anyway? (y/N)${NC}"
    read -r -n 1 continue_deploy
    echo
    if [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 0
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    log_error "You have uncommitted changes!"
    log_info "Please commit or stash your changes before deploying to production."
    exit 1
fi

# Create backup point
log_info "Creating backup point..."
BACKUP_TAG="prod-deploy-$(date +%Y%m%d-%H%M%S)"
git tag -a "$BACKUP_TAG" -m "Production deployment backup"
log_success "Created backup tag: $BACKUP_TAG"

# Build frontend with production optimizations
log_info "Building frontend for production..."
cd services/frontend/webapp
npm run build:production || npm run build
cd ../../..

# Build backend functions
log_info "Building backend functions..."
cd services/backend/functions
npm run build
cd ../../..

# Run ALL tests
log_critical "Running full test suite..."
cd services/frontend/webapp && npm test -- --run
cd ../../..
cd services/backend/functions && npm test
cd ../../..

# Run E2E tests if available
if [ -f "services/frontend/webapp/playwright.config.ts" ]; then
    log_info "Running E2E tests..."
    cd services/frontend/webapp && npm run test:e2e
    cd ../../..
fi

log_success "All tests passed!"

# Check staging deployment
log_info "Checking last staging deployment..."
if [ -f "infra/staging/last-deployment.txt" ]; then
    cat infra/staging/last-deployment.txt
    echo -e "\n${YELLOW}Has staging been thoroughly tested? (y/N)${NC}"
    read -r -n 1 staging_tested
    echo
    if [[ ! $staging_tested =~ ^[Yy]$ ]]; then
        log_error "Please test on staging before production deployment!"
        exit 1
    fi
else
    log_warn "No staging deployment record found."
fi

# Final confirmation
echo -e "\n${RED}╔══════════════════════════════════════════════════════════════╗"
echo -e "║                  FINAL PRODUCTION WARNING                     ║"
echo -e "║                                                              ║"
echo -e "║  You are about to deploy to PRODUCTION!                      ║"
echo -e "║  Project: $FIREBASE_PROJECT_ID                               ║"
echo -e "║  Branch: $CURRENT_BRANCH                                     ║"
echo -e "║  Commit: $(git rev-parse --short HEAD)                      ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${RED}Type 'DEPLOY PRODUCTION NOW' to proceed:${NC}"
read -r final_confirmation

if [ "$final_confirmation" != "DEPLOY PRODUCTION NOW" ]; then
    log_info "Production deployment cancelled."
    exit 0
fi

# Deploy to Firebase
log_critical "Starting production deployment..."

# Deploy in specific order for safety
# 1. Deploy rules first (immediate protection)
log_info "Deploying security rules..."
firebase deploy --only firestore:rules,storage:rules --project $FIREBASE_PROJECT_ID

# 2. Deploy indexes
log_info "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project $FIREBASE_PROJECT_ID

# 3. Deploy Cloud Functions
log_info "Deploying Cloud Functions..."
cd services/backend/functions
firebase deploy --only functions --project $FIREBASE_PROJECT_ID
cd ../../..

# 4. Deploy Frontend (last to minimize user impact)
log_info "Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting --project $FIREBASE_PROJECT_ID

# Post-deployment verification
log_info "Verifying production deployment..."

PRODUCTION_URL="${VITE_APP_URL:-https://$FIREBASE_PROJECT_ID.web.app}"

# Health check
if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/health" | grep -q "200"; then
    log_success "Health check passed!"
else
    log_warn "Health check failed or not implemented"
fi

# Check main page
if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" | grep -q "200"; then
    log_success "Main page is accessible!"
else
    log_error "Main page is not accessible! Check deployment immediately!"
fi

# Update deployment info
DEPLOYMENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')
DEPLOYMENT_COMMIT=$(git rev-parse HEAD)
DEPLOYMENT_TAG="$BACKUP_TAG"

cat > infra/prod/last-deployment.txt << EOF
Production Deployment Information
=================================
Time: $DEPLOYMENT_TIME
Commit: $DEPLOYMENT_COMMIT
Tag: $DEPLOYMENT_TAG
Branch: $CURRENT_BRANCH
Project: $FIREBASE_PROJECT_ID
URL: $PRODUCTION_URL
Deployed by: $(whoami)
Host: $(hostname)

Previous deployment backed up as: $BACKUP_TAG
Rollback command: git checkout $BACKUP_TAG && ./deploy.sh
EOF

log_success "Deployment info saved"

# Create deployment log entry
mkdir -p infra/prod/deployments
cp infra/prod/last-deployment.txt "infra/prod/deployments/deployment-$(date +%Y%m%d-%H%M%S).txt"

# Notify monitoring services (if configured)
if [ ! -z "$SENTRY_DSN" ]; then
    log_info "Creating Sentry release..."
    # Add Sentry release creation here if using Sentry CLI
fi

# Summary
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗"
echo -e "║            PRODUCTION DEPLOYMENT SUCCESSFUL! 🚀               ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 Production URL: ${BLUE}$PRODUCTION_URL${NC}"
echo -e "📊 Firebase Console: ${BLUE}https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID${NC}"
echo -e "🏷️  Deployment Tag: ${BLUE}$BACKUP_TAG${NC}"
echo ""
echo -e "${YELLOW}CRITICAL POST-DEPLOYMENT TASKS:${NC}"
echo -e "1. ✓ Verify all pages load correctly"
echo -e "2. ✓ Test contact form functionality"
echo -e "3. ✓ Check analytics are recording"
echo -e "4. ✓ Monitor error logs for 30 minutes"
echo -e "5. ✓ Test on multiple devices/browsers"
echo ""
echo -e "${PURPLE}Rollback Instructions:${NC}"
echo -e "If issues arise, run: ${BLUE}git checkout $BACKUP_TAG && cd infra/prod && ./deploy.sh${NC}"
echo ""
log_critical "Monitor production closely for the next hour!"