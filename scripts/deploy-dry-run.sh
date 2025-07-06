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
