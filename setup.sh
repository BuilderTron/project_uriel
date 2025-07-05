#!/usr/bin/env bash

# Project Uriel Setup Script
# Sets up local development environment with Firebase emulators and React

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Helper functions for colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                      PROJECT URIEL                          ║"
    echo "║                Personal Portfolio Setup                      ║"
    echo "║                                                              ║"
    echo "║   React + Firebase + Docker + TypeScript                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Detect platform
detect_platform() {
    case "$OSTYPE" in
        darwin*)
            if [[ $(uname -m) == "arm64" ]]; then
                PLATFORM="macos-arm"
            else
                PLATFORM="macos-intel"
            fi
            ;;
        linux-gnu*)
            PLATFORM="linux"
            ;;
        msys* | mingw* | cygwin*)
            PLATFORM="windows"
            ;;
        *)
            PLATFORM="unknown"
            ;;
    esac
    print_info "Detected platform: $PLATFORM"
}

# Setup environment file
setup_env_file() {
    print_info "Setting up environment configuration..."
    
    if [[ -f .env.local ]]; then
        print_warning ".env.local already exists"
        read -p "Do you want to backup and recreate it? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.local ".env.local.backup.$(date +%Y%m%d_%H%M%S)"
            print_info "Backed up existing .env.local"
        else
            print_info "Keeping existing .env.local"
            return 0
        fi
    fi

    cat > .env.local << EOF
# Project Uriel Local Development Environment
# Generated on $(date)

# Environment
ENVIRONMENT=local
PLATFORM=$PLATFORM

# Firebase Project Configuration
FIREBASE_PROJECT_ID=project-uriel-local
FIREBASE_API_KEY=demo-api-key
FIREBASE_AUTH_DOMAIN=project-uriel-local.firebaseapp.com
FIREBASE_DATABASE_URL=http://localhost:8080
FIREBASE_STORAGE_BUCKET=project-uriel-local.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Emulator Configuration
FIREBASE_EMULATOR_HOST=localhost
FIRESTORE_EMULATOR_PORT=8080
AUTH_EMULATOR_PORT=9099
FUNCTIONS_EMULATOR_PORT=5001
STORAGE_EMULATOR_PORT=9199
HOSTING_EMULATOR_PORT=5000
PUBSUB_EMULATOR_PORT=8085

# Frontend Configuration
VITE_USE_EMULATORS=true
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=project-uriel-local.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-uriel-local
VITE_FIREBASE_STORAGE_BUCKET=project-uriel-local.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Development Settings
NODE_ENV=development
DEBUG=uriel:*
LOG_LEVEL=debug

# Email Configuration (for contact form testing)
SENDGRID_API_KEY=your-sendgrid-key-here
ADMIN_EMAIL=admin@project-uriel.local

# Analytics (disabled in local)
VITE_ENABLE_ANALYTICS=false
VITE_GA_MEASUREMENT_ID=

# Security (development only)
JWT_SECRET=local-development-secret-change-in-production
API_RATE_LIMIT=1000

# Docker Configuration
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

EOF

    print_success "Created .env.local with default configuration"
    print_info "You can modify .env.local to customize your local setup"
}

# Check for required tools
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        case $PLATFORM in
            macos-*)
                print_info "Install with: brew install node"
                ;;
            linux)
                print_info "Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
                ;;
            windows)
                print_info "Download from: https://nodejs.org/"
                ;;
        esac
        return 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check version is 18+
    if [[ ! $NODE_VERSION =~ v1[8-9]\.|v[2-9][0-9]\. ]]; then
        print_warning "Node.js version should be 18+ for best compatibility"
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        case $PLATFORM in
            macos-*)
                print_info "Install Docker Desktop from: https://docs.docker.com/desktop/install/mac-install/"
                ;;
            linux)
                print_info "Install with: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
                ;;
            windows)
                print_info "Install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/"
                ;;
        esac
        
        read -p "Continue without Docker? Firebase emulators will be limited. (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Docker is required for full local development. Please install Docker and run setup again."
            exit 1
        fi
        return 1
    fi
    
    print_success "Docker found: $(docker --version)"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_info "Please start Docker Desktop and run setup again"
        return 1
    fi
    
    # Check for Docker Compose
    if docker compose version &> /dev/null; then
        print_success "Docker Compose (integrated) found: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        print_success "Docker Compose (standalone) found: $(docker-compose --version)"
    else
        print_error "Docker Compose not found"
        print_info "Please install Docker Compose"
        return 1
    fi
}

check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI is not installed"
        print_info "Installing Firebase CLI..."
        
        if command -v npm &> /dev/null; then
            npm install -g firebase-tools
            print_success "Firebase CLI installed"
        else
            print_error "npm not found, cannot install Firebase CLI"
            print_info "Please install Node.js first"
            return 1
        fi
    else
        print_success "Firebase CLI found: $(firebase --version | head -1)"
    fi
}

setup_git_hooks() {
    print_info "Setting up Git hooks..."
    
    if [[ ! -d .git ]]; then
        print_warning "Not a Git repository. Skipping Git hooks."
        return 0
    fi
    
    mkdir -p .git/hooks
    
    # Pre-push hook
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Project Uriel pre-push hook

# Check if setup has been run
if [[ ! -f .env.local ]]; then
    echo "❌ Setup not completed. Run ./setup.sh first."
    exit 1
fi

# Source the commands (if available)
if [[ -f scripts/commands.sh ]]; then
    source scripts/commands.sh
    
    echo "🔍 Running pre-push checks..."
    
    # Run linting
    if command -v lint &> /dev/null; then
        echo "Running linter..."
        if ! lint; then
            echo "❌ Linting failed. Fix errors before pushing."
            exit 1
        fi
    fi
    
    # Run type checking
    if command -v type-check &> /dev/null; then
        echo "Running TypeScript type check..."
        if ! type-check; then
            echo "❌ Type checking failed. Fix errors before pushing."
            exit 1
        fi
    fi
    
    # Run tests
    if command -v test &> /dev/null; then
        echo "Running tests..."
        if ! test; then
            echo "❌ Tests failed. Fix failing tests before pushing."
            exit 1
        fi
    fi
    
    echo "✅ All pre-push checks passed!"
else
    echo "⚠️  Command scripts not found. Skipping automated checks."
fi

exit 0
EOF
    
    chmod +x .git/hooks/pre-push
    print_success "Git pre-push hook installed"
}

setup_direnv() {
    if command -v direnv &> /dev/null; then
        print_success "direnv found: $(direnv version)"
        return 0
    fi
    
    print_warning "direnv not found"
    print_info "direnv automatically loads project commands when you enter the directory"
    
    read -p "Would you like to install direnv? (Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Skipping direnv installation"
        return 0
    fi
    
    case $PLATFORM in
        macos-*)
            if command -v brew &> /dev/null; then
                brew install direnv
            else
                print_error "Homebrew not found. Please install direnv manually: https://direnv.net/"
                return 1
            fi
            ;;
        linux)
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y direnv
            elif command -v yum &> /dev/null; then
                sudo yum install -y direnv
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y direnv
            else
                print_error "Package manager not found. Please install direnv manually: https://direnv.net/"
                return 1
            fi
            ;;
        windows)
            print_error "Please install direnv manually: https://direnv.net/"
            return 1
            ;;
    esac
    
    if command -v direnv &> /dev/null; then
        print_success "direnv installed successfully"
        setup_direnv_hook
    else
        print_error "direnv installation failed"
        return 1
    fi
}

setup_direnv_hook() {
    print_info "Setting up direnv shell hook..."
    
    SHELL_CONFIG=""
    case $SHELL in
        */bash)
            if [[ $PLATFORM == "macos-"* ]]; then
                SHELL_CONFIG="$HOME/.bash_profile"
            else
                SHELL_CONFIG="$HOME/.bashrc"
            fi
            HOOK_LINE='eval "$(direnv hook bash)"'
            ;;
        */zsh)
            SHELL_CONFIG="$HOME/.zshrc"
            HOOK_LINE='eval "$(direnv hook zsh)"'
            ;;
        */fish)
            SHELL_CONFIG="$HOME/.config/fish/config.fish"
            HOOK_LINE='direnv hook fish | source'
            ;;
        *)
            print_warning "Unknown shell: $SHELL. Please manually add direnv hook."
            print_info "See: https://direnv.net/docs/hook.html"
            return 0
            ;;
    esac
    
    if [[ -f $SHELL_CONFIG ]] && grep -q "direnv hook" "$SHELL_CONFIG"; then
        print_info "direnv hook already configured in $SHELL_CONFIG"
    else
        echo "$HOOK_LINE" >> "$SHELL_CONFIG"
        print_success "Added direnv hook to $SHELL_CONFIG"
        print_info "Restart your shell or run: source $SHELL_CONFIG"
    fi
}

create_activation_files() {
    print_info "Creating activation files..."
    
    # Create .envrc for direnv
    cat > .envrc << 'EOF'
#!/usr/bin/env bash
# Project Uriel direnv configuration

# Load environment variables
if [[ -f .env.local ]]; then
    dotenv .env.local
fi

# Load project commands
if [[ -f scripts/commands.sh ]]; then
    source scripts/commands.sh
    echo "🚀 Project Uriel commands loaded! Type 'commands' for help."
fi
EOF
    
    # Create manual activation script
    cat > activate << 'EOF'
#!/usr/bin/env bash
# Project Uriel manual activation script
# Run: source activate

# Load environment variables
if [[ -f .env.local ]]; then
    set -a  # automatically export all variables
    source .env.local
    set +a
fi

# Load project commands
if [[ -f scripts/commands.sh ]]; then
    source scripts/commands.sh
    echo "🚀 Project Uriel commands loaded! Type 'commands' for help."
else
    echo "⚠️  Command scripts not found. Some features may not be available."
fi
EOF
    
    chmod +x activate
    print_success "Created activation files (.envrc and activate)"
    
    if command -v direnv &> /dev/null; then
        print_info "Allowing direnv for this directory..."
        direnv allow .
        print_success "direnv configured"
    fi
}

install_dependencies() {
    print_info "Installing project dependencies..."
    
    # Frontend dependencies
    if [[ -f services/frontend/webapp/package.json ]]; then
        print_info "Installing frontend dependencies..."
        cd services/frontend/webapp
        npm install
        cd ../../../
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend package.json not found. Skipping frontend dependencies."
    fi
    
    # Backend dependencies
    if [[ -f services/backend/functions/package.json ]]; then
        print_info "Installing backend dependencies..."
        cd services/backend/functions
        npm install
        cd ../../../
        print_success "Backend dependencies installed"
    else
        print_warning "Backend package.json not found. Skipping backend dependencies."
    fi
}

show_completion_message() {
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗"
    echo -e "║                    SETUP COMPLETED! 🎉                      ║"
    echo -e "╚══════════════════════════════════════════════════════════════╝${NC}\n"
    
    print_success "Project Uriel is ready for development!"
    echo
    print_info "Next steps:"
    echo -e "  1. ${CYAN}source activate${NC} or restart your shell (if using direnv)"
    echo -e "  2. ${CYAN}up${NC} to start all services"
    echo -e "  3. ${CYAN}dev${NC} to start the development server"
    echo -e "  4. Visit ${CYAN}http://localhost:5173${NC} for the frontend"
    echo -e "  5. Visit ${CYAN}http://localhost:4000${NC} for Firebase Emulator UI"
    echo
    print_info "Available commands after activation:"
    echo -e "  • ${CYAN}commands${NC} - Show all available commands"
    echo -e "  • ${CYAN}up/down${NC} - Start/stop services"
    echo -e "  • ${CYAN}logs${NC} - View service logs"
    echo -e "  • ${CYAN}test${NC} - Run tests"
    echo -e "  • ${CYAN}build${NC} - Build for production"
    echo
    print_info "For help: check README.md or the docs/ directory"
    echo -e "\n${YELLOW}Happy coding! 🚀${NC}\n"
}

# Main setup function
main() {
    clear
    print_banner
    echo
    
    print_info "Starting Project Uriel setup..."
    echo
    
    # Detect platform
    detect_platform
    echo
    
    # Setup environment
    setup_env_file
    echo
    
    # Check dependencies
    print_info "Checking dependencies..."
    
    if ! check_node; then
        print_error "Node.js is required. Please install Node.js and run setup again."
        exit 1
    fi
    
    if ! check_docker; then
        print_warning "Docker not available. Some features will be limited."
    fi
    
    check_firebase_cli
    echo
    
    # Setup Git hooks
    setup_git_hooks
    echo
    
    # Setup direnv
    setup_direnv
    echo
    
    # Create activation files
    create_activation_files
    echo
    
    # Install dependencies
    install_dependencies
    echo
    
    # Show completion message
    show_completion_message
}

# Run main function
main "$@"