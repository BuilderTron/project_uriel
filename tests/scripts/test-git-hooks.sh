#!/bin/bash
# Git Hooks Testing Suite for Project Uriel
# Tests the git hooks implementation from PU-6

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0

# Helper functions
log_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Branch validation function (extracted from pre-push hook)
validate_branch_name() {
    local branch_name="$1"
    
    # Allow main, develop, and sprint branches
    if [[ "$branch_name" =~ ^(main|develop|sprint/.+)$ ]]; then
        return 0
    fi
    
    # Validate feature/fix/hotfix branch naming
    if [[ "$branch_name" =~ ^(feature|fix|hotfix)/PU-[0-9]+-[a-z0-9-]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Commit message validation function (simplified)
validate_commit_format() {
    local commit_msg="$1"
    local conventional_pattern="^(feat|fix|docs|style|refactor|test|chore|ci|perf|build)(\([a-zA-Z0-9_-]+\))?(!)?: .{1,50}$"
    
    if [[ "$commit_msg" =~ $conventional_pattern ]]; then
        return 0
    else
        return 1
    fi
}

echo "🧪 Git Hooks Testing Suite"
echo "=========================="

# Test 1: Branch Name Validation
echo ""
echo "📋 Testing Branch Name Validation..."

# Valid branch names
log_test "Valid branch: feature/PU-6-git-hooks-ci-foundation"
if validate_branch_name "feature/PU-6-git-hooks-ci-foundation"; then
    log_pass "Accepted valid feature branch"
else
    log_fail "Rejected valid feature branch"
fi

log_test "Valid branch: fix/PU-12-auth-bug-fix"
if validate_branch_name "fix/PU-12-auth-bug-fix"; then
    log_pass "Accepted valid fix branch"
else
    log_fail "Rejected valid fix branch"
fi

log_test "Valid branch: main"
if validate_branch_name "main"; then
    log_pass "Accepted main branch"
else
    log_fail "Rejected main branch"
fi

log_test "Valid branch: develop"
if validate_branch_name "develop"; then
    log_pass "Accepted develop branch"
else
    log_fail "Rejected develop branch"
fi

log_test "Valid branch: sprint/sprint-01"
if validate_branch_name "sprint/sprint-01"; then
    log_pass "Accepted sprint branch"
else
    log_fail "Rejected sprint branch"
fi

# Invalid branch names
log_test "Invalid branch: feature/add-stuff"
if ! validate_branch_name "feature/add-stuff"; then
    log_pass "Correctly rejected invalid feature branch"
else
    log_fail "Incorrectly accepted invalid feature branch"
fi

log_test "Invalid branch: my-feature-branch"
if ! validate_branch_name "my-feature-branch"; then
    log_pass "Correctly rejected non-standard branch"
else
    log_fail "Incorrectly accepted non-standard branch"
fi

log_test "Invalid branch: feature/PU-6-Invalid-Caps"
if ! validate_branch_name "feature/PU-6-Invalid-Caps"; then
    log_pass "Correctly rejected branch with capital letters"
else
    log_fail "Incorrectly accepted branch with capital letters"
fi

# Test 2: Commit Message Validation
echo ""
echo "📝 Testing Commit Message Validation..."

log_test "Valid commit: feat(functions): add contact form handler"
if validate_commit_format "feat(functions): add contact form handler"; then
    log_pass "Accepted valid conventional commit"
else
    log_fail "Rejected valid conventional commit"
fi

log_test "Valid commit: fix(rules): correct user permission validation"
if validate_commit_format "fix(rules): correct user permission validation"; then
    log_pass "Accepted valid fix commit"
else
    log_fail "Rejected valid fix commit"
fi

log_test "Valid commit: docs: update readme"
if validate_commit_format "docs: update readme"; then
    log_pass "Accepted valid docs commit without scope"
else
    log_fail "Rejected valid docs commit without scope"
fi

log_test "Invalid commit: added some stuff"
if ! validate_commit_format "added some stuff"; then
    log_pass "Correctly rejected non-conventional commit"
else
    log_fail "Incorrectly accepted non-conventional commit"
fi

log_test "Invalid commit: Fix: Something"
if ! validate_commit_format "Fix: Something"; then
    log_pass "Correctly rejected commit with capital type"
else
    log_fail "Incorrectly accepted commit with capital type"
fi

# Test 3: Git Hook Files Existence
echo ""
echo "📂 Testing Git Hook Files..."

log_test "Pre-push hook exists and is executable"
if [[ -x ".git/hooks/pre-push" ]]; then
    log_pass "Pre-push hook exists and is executable"
else
    log_fail "Pre-push hook missing or not executable"
fi

log_test "Commit-msg hook exists and is executable"
if [[ -x ".git/hooks/commit-msg" ]]; then
    log_pass "Commit-msg hook exists and is executable"
else
    log_fail "Commit-msg hook missing or not executable"
fi

# Test Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

if [[ $PASSED_TESTS -eq $TOTAL_TESTS ]]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi