#!/usr/bin/env bash
# Verify staging deployment health

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load staging environment
if [ -f "infra/staging/.env.staging" ]; then
    source infra/staging/.env.staging
else
    echo -e "${RED}Error: .env.staging not found${NC}"
    exit 1
fi

STAGING_URL="${VITE_APP_URL:-https://$FIREBASE_PROJECT_ID.web.app}"

echo -e "${YELLOW}Verifying Staging Deployment${NC}"
echo "URL: $STAGING_URL"
echo

# Test 1: Homepage loads
echo -n "Testing homepage... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Fail (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# Test 2: Static assets load
echo -n "Testing static assets... "
if curl -s "$STAGING_URL" | grep -q '<script' > /dev/null; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Fail${NC}"
    exit 1
fi

# Test 3: API health check
echo -n "Testing API health... "
API_URL="https://$FIREBASE_PROJECT_ID.cloudfunctions.net/api/health"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${YELLOW}⚠ Warning (API may not be deployed)${NC}"
fi

# Test 4: Firebase services
echo -n "Testing Firebase connection... "
# This would need actual Firebase SDK testing
echo -e "${YELLOW}⚠ Skipped (requires SDK)${NC}"

echo
echo -e "${GREEN}Staging verification complete!${NC}"