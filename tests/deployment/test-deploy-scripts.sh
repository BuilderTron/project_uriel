#!/usr/bin/env bash
# Test deployment scripts without actually deploying

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗"
echo -e "║            DEPLOYMENT SCRIPTS TEST SUITE                      ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo

# Test 1: Check if deployment scripts exist
log_info "Testing deployment script existence..."
SCRIPTS_OK=true

for env in staging prod; do
    if [ -f "infra/$env/deploy.sh" ]; then
        log_success "✓ infra/$env/deploy.sh exists"
    else
        log_error "✗ infra/$env/deploy.sh missing"
        SCRIPTS_OK=false
    fi
    
    if [ -x "infra/$env/deploy.sh" ]; then
        log_success "✓ infra/$env/deploy.sh is executable"
    else
        log_error "✗ infra/$env/deploy.sh is not executable"
        SCRIPTS_OK=false
    fi
done

# Test 2: Check environment templates
log_info "Testing environment templates..."
ENV_OK=true

# Check staging
if [ -f "infra/staging/.env.staging.example" ]; then
    log_success "✓ .env.staging.example exists"
else
    log_error "✗ .env.staging.example missing"
    ENV_OK=false
fi

# Check production
if [ -f "infra/prod/.env.production.example" ]; then
    log_success "✓ .env.production.example exists"
else
    log_error "✗ .env.production.example missing"
    ENV_OK=false
fi

# Check development
if [ -f "infra/dev/.env.development.example" ]; then
    log_success "✓ .env.development.example exists"
else
    log_error "✗ .env.development.example missing"
    ENV_OK=false
fi

# Test 3: Validate deployment script syntax
log_info "Validating deployment script syntax..."
SYNTAX_OK=true

for env in staging prod; do
    if bash -n "infra/$env/deploy.sh" 2>/dev/null; then
        log_success "✓ infra/$env/deploy.sh syntax is valid"
    else
        log_error "✗ infra/$env/deploy.sh has syntax errors"
        bash -n "infra/$env/deploy.sh"
        SYNTAX_OK=false
    fi
done

# Test 4: Test deployment dry run
log_info "Testing deployment dry run capability..."

# Create a dry-run version of staging deploy
cat > scripts/deploy-dry-run.sh << 'EOF'
#!/usr/bin/env bash
# Dry run deployment test

set -e

# Source the original with modifications
export DRY_RUN=true

# Override firebase command
firebase() {
    echo "[DRY RUN] Would execute: firebase $@"
    return 0
}

# Override npm commands
npm() {
    case "$1" in
        "run")
            echo "[DRY RUN] Would execute: npm $@"
            ;;
        "test")
            echo "[DRY RUN] Would execute: npm $@"
            ;;
        *)
            command npm "$@"
            ;;
    esac
}

# Export overrides
export -f firebase
export -f npm

# Create fake env file
cat > .env.staging.test << 'ENVEOF'
FIREBASE_PROJECT_ID=test-project
FIREBASE_API_KEY=test-key
SENDGRID_API_KEY=test-sendgrid
RECAPTCHA_SECRET_KEY=test-recaptcha
JWT_SECRET=test-secret
SENTRY_DSN=test-sentry
ENVEOF

# Run in test mode
cd infra/staging
cp .env.staging.test .env.staging
echo "y" | bash deploy.sh || true
rm -f .env.staging .env.staging.test
EOF

chmod +x scripts/deploy-dry-run.sh

# Test 5: Check required tools
log_info "Checking required deployment tools..."
TOOLS_OK=true

# Check Firebase CLI
if command -v firebase &> /dev/null; then
    log_success "✓ Firebase CLI installed: $(firebase --version | head -1)"
else
    log_error "✗ Firebase CLI not installed"
    TOOLS_OK=false
fi

# Check npm
if command -v npm &> /dev/null; then
    log_success "✓ npm installed: $(npm --version)"
else
    log_error "✗ npm not installed"
    TOOLS_OK=false
fi

# Check git
if command -v git &> /dev/null; then
    log_success "✓ git installed: $(git --version)"
else
    log_error "✗ git not installed"
    TOOLS_OK=false
fi

# Test 6: Validate Firebase configuration
log_info "Checking Firebase configuration..."
FIREBASE_OK=true

if [ -f "firebase.json" ]; then
    log_success "✓ firebase.json exists"
    
    # Check if it has required sections
    if grep -q "firestore" firebase.json; then
        log_success "✓ Firestore configuration found"
    else
        log_error "✗ Firestore configuration missing"
        FIREBASE_OK=false
    fi
    
    if grep -q "functions" firebase.json; then
        log_success "✓ Functions configuration found"
    else
        log_error "✗ Functions configuration missing"
        FIREBASE_OK=false
    fi
    
    if grep -q "hosting" firebase.json; then
        log_success "✓ Hosting configuration found"
    else
        log_error "✗ Hosting configuration missing"
        FIREBASE_OK=false
    fi
else
    log_error "✗ firebase.json missing"
    FIREBASE_OK=false
fi

# Test 7: Check build commands
log_info "Testing build commands existence..."
BUILD_OK=true

# Check frontend build
if [ -f "services/frontend/webapp/package.json" ]; then
    if grep -q '"build"' services/frontend/webapp/package.json; then
        log_success "✓ Frontend build command exists"
    else
        log_error "✗ Frontend build command missing"
        BUILD_OK=false
    fi
else
    log_error "✗ Frontend package.json missing"
    BUILD_OK=false
fi

# Check backend build
if [ -f "services/backend/functions/package.json" ]; then
    if grep -q '"build"' services/backend/functions/package.json; then
        log_success "✓ Backend build command exists"
    else
        log_error "✗ Backend build command missing"
        BUILD_OK=false
    fi
else
    log_error "✗ Backend package.json missing"
    BUILD_OK=false
fi

# Summary
echo
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"

TOTAL_TESTS=7
PASSED_TESTS=0

[ "$SCRIPTS_OK" = true ] && ((PASSED_TESTS++))
[ "$ENV_OK" = true ] && ((PASSED_TESTS++))
[ "$SYNTAX_OK" = true ] && ((PASSED_TESTS++))
[ "$TOOLS_OK" = true ] && ((PASSED_TESTS++))
[ "$FIREBASE_OK" = true ] && ((PASSED_TESTS++))
[ "$BUILD_OK" = true ] && ((PASSED_TESTS++))

echo
echo "Deployment Scripts: $([ "$SCRIPTS_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo "Environment Files: $([ "$ENV_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo "Script Syntax: $([ "$SYNTAX_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo "Required Tools: $([ "$TOOLS_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo "Firebase Config: $([ "$FIREBASE_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo "Build Commands: $([ "$BUILD_OK" = true ] && echo "✓ PASS" || echo "✗ FAIL")"
echo
echo "Total: $PASSED_TESTS/$TOTAL_TESTS tests passed"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}All deployment tests passed! 🎉${NC}"
    echo -e "\n${YELLOW}Next steps to test actual deployment:${NC}"
    echo "1. Create test Firebase projects (staging/prod)"
    echo "2. Copy .env.*.example files and fill in real values"
    echo "3. Run deployment with --dry-run flag (if available)"
    echo "4. Test on staging environment first"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please fix issues before deploying.${NC}"
    exit 1
fi