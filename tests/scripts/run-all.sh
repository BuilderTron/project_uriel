#!/usr/bin/env bash
# Run all Project Uriel tests

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗"
echo -e "║              PROJECT URIEL - FULL TEST SUITE                  ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo

FAILED_SUITES=0

# Function to run a test suite
run_suite() {
    local name=$1
    local command=$2
    
    echo -e "\n${YELLOW}Running $name...${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ $name passed${NC}"
    else
        echo -e "${RED}✗ $name failed${NC}"
        ((FAILED_SUITES++))
    fi
}

# Change to project root
cd "$(dirname "$0")/../.."

# 1. Git Hooks Tests
if [ -f "tests/scripts/test-git-hooks.sh" ]; then
    run_suite "Git Hooks" "./tests/scripts/test-git-hooks.sh"
fi

# 2. Deployment Script Tests
if [ -f "tests/deployment/test-deploy-scripts.sh" ]; then
    run_suite "Deployment Scripts" "./tests/deployment/test-deploy-scripts.sh"
fi

# 3. Frontend Tests
if [ -d "services/frontend/webapp" ] && [ -f "services/frontend/webapp/package.json" ]; then
    if grep -q '"test"' services/frontend/webapp/package.json; then
        run_suite "Frontend Tests" "cd services/frontend/webapp && npm test -- --run"
    fi
fi

# 4. Backend Tests
if [ -d "services/backend/functions" ] && [ -f "services/backend/functions/package.json" ]; then
    if grep -q '"test"' services/backend/functions/package.json; then
        run_suite "Backend Tests" "cd services/backend/functions && npm test -- --passWithNoTests"
    fi
fi

# 5. Firebase Rules Tests
if [ -f "services/backend/firestore/firestore.rules" ]; then
    echo -e "\n${YELLOW}Firebase Rules Tests${NC}"
    echo -e "${YELLOW}⚠ Skipped (requires emulator setup)${NC}"
fi

# 6. Unit Tests (centralized)
if [ -d "tests/unit" ]; then
    echo -e "\n${YELLOW}Running Unit Tests (Backend Auth)...${NC}"
    if command -v mocha >/dev/null 2>&1; then
        run_suite "Unit Tests - Auth Functions" "cd tests/unit/backend && npm test auth-functions.test.ts"
        run_suite "Unit Tests - Auth Middleware" "cd tests/unit/backend && npm test auth-middleware.test.ts"
        run_suite "Unit Tests - Auth Triggers" "cd tests/unit/backend && npm test auth-triggers.test.ts"
    else
        echo -e "${YELLOW}⚠ Mocha not available, skipping unit tests${NC}"
    fi
fi

# 7. Integration Tests
if [ -d "tests/integration" ]; then
    echo -e "\n${YELLOW}Running Integration Tests...${NC}"
    if command -v mocha >/dev/null 2>&1; then
        run_suite "Integration Tests - Login Flow" "cd tests/integration/auth && npm test login-flow.test.ts"
        run_suite "Integration Tests - Role Management" "cd tests/integration/auth && npm test role-management.test.ts"
        run_suite "Integration Tests - Security Rules" "cd tests/integration/auth && npm test security-rules.test.ts"
    else
        echo -e "${YELLOW}⚠ Mocha not available, skipping integration tests${NC}"
    fi
fi

# 8. E2E Tests
if [ -d "tests/e2e" ]; then
    echo -e "\n${YELLOW}Running E2E Tests...${NC}"
    if command -v playwright >/dev/null 2>&1; then
        run_suite "E2E Tests - User Registration" "cd tests/e2e/auth && npx playwright test user-registration.spec.ts"
        run_suite "E2E Tests - Admin Login" "cd tests/e2e/auth && npx playwright test admin-login.spec.ts"
        run_suite "E2E Tests - Protected Routes" "cd tests/e2e/auth && npx playwright test protected-routes.spec.ts"
    else
        echo -e "${YELLOW}⚠ Playwright not available, skipping E2E tests${NC}"
    fi
fi

# Summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

if [ $FAILED_SUITES -eq 0 ]; then
    echo -e "${GREEN}All test suites passed! 🎉${NC}"
    exit 0
else
    echo -e "${RED}$FAILED_SUITES test suite(s) failed${NC}"
    exit 1
fi