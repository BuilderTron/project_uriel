#!/usr/bin/env bash
# Production smoke tests - minimal tests to verify deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Production URL (should be passed as argument or from env)
PROD_URL="${1:-https://project-uriel.com}"

echo -e "${RED}╔══════════════════════════════════════════════════════════════╗"
echo -e "║              PRODUCTION SMOKE TESTS                           ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${YELLOW}Testing: $PROD_URL${NC}"
echo

FAILED=0

# Test 1: Homepage loads
echo -n "1. Homepage accessibility... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Fail (HTTP $HTTP_CODE)${NC}"
    ((FAILED++))
fi

# Test 2: HTTPS redirect
echo -n "2. HTTPS enforcement... "
HTTP_URL="${PROD_URL/https:/http:}"
REDIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$HTTP_URL" 2>/dev/null || echo "000")
if [ "$REDIRECT_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${YELLOW}⚠ Warning${NC}"
fi

# Test 3: Critical pages
echo "3. Critical pages:"
for page in "" "projects" "experience" "blog" "contact"; do
    echo -n "   - /$page... "
    PAGE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/$page")
    if [ "$PAGE_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Pass${NC}"
    else
        echo -e "${RED}✗ Fail (HTTP $PAGE_CODE)${NC}"
        ((FAILED++))
    fi
done

# Test 4: Performance check
echo -n "4. Response time... "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$PROD_URL")
if (( $(echo "$RESPONSE_TIME < 3" | bc -l) )); then
    echo -e "${GREEN}✓ Pass (${RESPONSE_TIME}s)${NC}"
else
    echo -e "${YELLOW}⚠ Warning (${RESPONSE_TIME}s > 3s)${NC}"
fi

# Test 5: Security headers
echo "5. Security headers:"
HEADERS=$(curl -s -I "$PROD_URL")
for header in "X-Frame-Options" "X-Content-Type-Options" "Strict-Transport-Security"; do
    echo -n "   - $header... "
    if echo "$HEADERS" | grep -qi "$header"; then
        echo -e "${GREEN}✓ Present${NC}"
    else
        echo -e "${YELLOW}⚠ Missing${NC}"
    fi
done

# Test 6: Analytics
echo -n "6. Analytics tag... "
if curl -s "$PROD_URL" | grep -q "gtag\|analytics" > /dev/null; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${YELLOW}⚠ Not found${NC}"
fi

# Summary
echo
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All critical tests passed! 🎉${NC}"
    echo -e "${GREEN}Production deployment verified successfully.${NC}"
    exit 0
else
    echo -e "${RED}$FAILED critical tests failed!${NC}"
    echo -e "${RED}Please investigate immediately.${NC}"
    exit 1
fi