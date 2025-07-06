#!/usr/bin/env bash
# Staging deployment script for Project Uriel

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Banner
echo -e "${YELLOW}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               PROJECT URIEL - STAGING DEPLOYMENT              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "deploy.sh" ] || [ ! -f ".env.staging.example" ]; then
    log_error "Please run this script from the infra/staging directory"
    exit 1
fi

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    log_error ".env.staging not found!"
    log_info "Copy .env.staging.example to .env.staging and update with your values"
    exit 1
fi

# Load environment variables
set -a
source .env.staging
set +a

# Validate required environment variables
REQUIRED_VARS=(
    "FIREBASE_PROJECT_ID"
    "FIREBASE_API_KEY"
    "SENDGRID_API_KEY"
    "RECAPTCHA_SECRET_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required variable $var is not set in .env.staging"
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

# Check if project exists
if ! firebase use $FIREBASE_PROJECT_ID --add 2>/dev/null; then
    log_warn "Firebase project $FIREBASE_PROJECT_ID not found or you don't have access"
    log_info "Make sure the project exists and you have proper permissions"
fi

# Build frontend
log_info "Building frontend for staging..."
cd services/frontend/webapp
npm run build:staging || npm run build
cd ../../..

# Build backend functions
log_info "Building backend functions..."
cd services/backend/functions
npm run build
cd ../../..

# Run tests
log_warn "Running tests before deployment..."
cd services/frontend/webapp && npm test -- --run
cd ../../..
cd services/backend/functions && npm test -- --passWithNoTests
cd ../../..

log_success "Tests passed!"

# Deploy to Firebase
log_info "Deploying to Firebase Staging..."

# Deploy Firestore rules
log_info "Deploying Firestore rules..."
firebase deploy --only firestore:rules --project $FIREBASE_PROJECT_ID

# Deploy Firestore indexes
log_info "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project $FIREBASE_PROJECT_ID

# Deploy Storage rules
log_info "Deploying Storage rules..."
firebase deploy --only storage --project $FIREBASE_PROJECT_ID

# Deploy Cloud Functions
log_info "Deploying Cloud Functions..."
cd services/backend/functions
firebase deploy --only functions --project $FIREBASE_PROJECT_ID
cd ../../..

# Deploy Frontend to Hosting
log_info "Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting --project $FIREBASE_PROJECT_ID

# Post-deployment tasks
log_info "Running post-deployment tasks..."

# Verify deployment
STAGING_URL="https://${FIREBASE_PROJECT_ID}.web.app"
log_info "Verifying deployment at $STAGING_URL..."

# Check if site is accessible
if curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL" | grep -q "200"; then
    log_success "Site is accessible!"
else
    log_warn "Site may not be fully deployed yet. Check $STAGING_URL"
fi

# Update deployment info
DEPLOYMENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')
DEPLOYMENT_COMMIT=$(git rev-parse --short HEAD)
DEPLOYMENT_BRANCH=$(git branch --show-current)

cat > infra/staging/last-deployment.txt << EOF
Deployment Information
=====================
Time: $DEPLOYMENT_TIME
Commit: $DEPLOYMENT_COMMIT
Branch: $DEPLOYMENT_BRANCH
Project: $FIREBASE_PROJECT_ID
URL: $STAGING_URL
Deployed by: $(whoami)
EOF

log_success "Deployment info saved to last-deployment.txt"

# Summary
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗"
echo -e "║              STAGING DEPLOYMENT SUCCESSFUL! 🎉                ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 Staging URL: ${BLUE}$STAGING_URL${NC}"
echo -e "📊 Firebase Console: ${BLUE}https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test all features on staging"
echo -e "2. Run performance tests"
echo -e "3. Check error monitoring"
echo -e "4. Verify analytics are working"
echo ""
log_info "Deployment complete!"