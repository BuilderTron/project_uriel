# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Uriel** is a modern personal portfolio application showcasing professional experience, projects, blog posts, and contact information. Built with React and Firebase, it emphasizes performance, scalability, and developer experience through containerized local development.

## Technology Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + Playwright (E2E)

### Backend

- **Platform**: Firebase
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Functions**: Cloud Functions (Node.js 18+)
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting / App Hosting

### Infrastructure

- **Local Development**: Docker + Firebase Emulator Suite
- **CI/CD**: GitHub Actions
- **Monitoring**: Firebase Performance Monitoring + Sentry

## Project Structure

```bash

project_uriel/
├── services/
│   ├── backend/
│   │   ├── functions/     # Cloud Functions
│   │   ├── firestore/     # Security rules & indexes
│   │   └── storage/       # Storage rules
│   └── frontend/
│       └── webapp/        # React application
├── infra/                 # Environment configs
├── scripts/               # Developer commands
└── docs/                  # Documentation

```

## Development Commands

After running `source activate`:

- `up` - Start all services
- `down` - Stop all services
- `logs` - View logs
- `test` - Run tests
- `build` - Build for production
- `deploy` - Deploy to Firebase

## Important Guidelines

### 1. Use GitHub CLI (gh) Commands

- **IMPORTANT**: Use `gh` commands instead of GitHub App integration
- `gh pr create` - Create pull requests from feature branches
- `gh issue list` - View Jira-linked GitHub issues
- `gh repo view` - Check repository status and deployments
- `gh workflow run` - Trigger CI/CD workflows manually

### 2. Use Atlassian MCP for Jira Management

- **PROJECT**: Project Uriel (PU) tickets in Jira
- Use `mcp__atlassian__*` functions for ticket updates
- Update ticket status when starting/completing work
- Link GitHub PRs to Jira tickets in commit messages
- Follow PU-XXX ticket numbering (e.g., PU-3, PU-7)

### 3. Always Use Context7 for Best Practices

- **CRITICAL**: Reference context7 for the latest Firebase and React best practices
- Check context7 for security patterns, performance optimizations, and architectural decisions
- Use context7 examples for Firebase emulator configurations and Docker setups

### 4. Code Standards

- Use TypeScript for all new code
- Follow React hooks best practices
- Implement proper error boundaries
- Use Tailwind CSS utility classes
- Write tests for all new features

### 5. Firebase Patterns

- Use Firestore security rules for all data access
- Implement proper indexes for queries
- Use Cloud Functions for server-side logic
- Follow Firebase naming conventions

### 6. Performance Requirements

- Lighthouse score must be >95
- Time to Interactive <3s
- Implement code splitting
- Use lazy loading for images
- Cache Firebase queries appropriately

### 7. Security First

- Never expose API keys in frontend code
- Validate all user inputs
- Use Firebase security rules extensively
- Implement rate limiting on Cloud Functions
- Follow OWASP best practices

## Branch Strategy (from Hermes)

- `main` - Production branch
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `release/*` - Release preparation

## Testing Requirements

- Unit test coverage >80%
- Integration tests for all API endpoints
- E2E tests for critical user flows
- Firebase rules tests mandatory
- Performance tests for key pages

## Common Tasks

### Adding a New Feature

1. Create feature branch from develop
2. Update MEMORY.md if adding new patterns
3. Write tests first (TDD approach)
4. Implement feature
5. Run `test` to verify
6. Create PR to develop

### Updating Firebase Rules

1. Edit rules in `services/backend/firestore/firestore.rules`
2. Test locally with emulators
3. Run Firebase rules tests
4. Deploy to staging first

### Performance Optimization

1. Run Lighthouse audit
2. Check bundle size with `build --analyze`
3. Implement suggested optimizations
4. Verify improvements locally
5. Deploy to staging for real-world testing

## Memory Files Structure

The project uses MEMORY.md files in each major directory to provide context-specific guidance:

### Service-Specific Memory Files

- **[Frontend MEMORY](services/frontend/webapp/MEMORY.md)** - React, TypeScript, Vite, Tailwind CSS patterns and best practices
- **[Backend MEMORY](services/backend/MEMORY.md)** - Firebase Functions, Firestore, security rules, and Cloud Functions patterns
- **[Infrastructure MEMORY](infra/MEMORY.md)** - Docker setup, deployment strategies, CI/CD with GitHub Actions
- **[Scripts MEMORY](scripts/MEMORY.md)** - Developer commands and productivity tools (IMPORTANT: Always use these!)
- **[Tests MEMORY](tests/MEMORY.md)** - Testing strategy, patterns, and deployment verification (CRITICAL: Use test commands!)

### Key Information from Memory Files

#### Frontend (React + TypeScript + Vite)

- Strict TypeScript configuration with type safety
- TanStack Query for server state management
- Feature-based folder structure
- Performance requirements: Lighthouse >95, TTI <3s
- Testing with Vitest and Playwright

#### Backend (Firebase)

- Cloud Functions with Node.js 18+
- Firestore security rules with RBAC
- Email integration with SendGrid
- Proper error handling and logging
- Cost optimization strategies

#### Infrastructure Setup

- Docker Compose for local development
- Firebase Emulator Suite for offline development
- Multi-environment setup (local, dev, staging, prod)
- GitHub Actions for CI/CD
- Security headers and monitoring

#### Developer Commands

- `up`/`down` - Start/stop services
- `test` - Run all tests
- `deploy:staging`/`deploy:prod` - Deployment commands
- `logs` - View service logs
- Always run `source activate` to load commands!

#### Testing Strategy (Comprehensive)

- Multi-layer testing: Unit, Integration, E2E, Deployment
- Deployment verification: `test:deployment`, `test:staging`, `test:production`
- Performance testing: Lighthouse audits, bundle analysis
- Security testing: Firebase rules, vulnerability scanning
- CI/CD integration: Automated testing in GitHub Actions
- Test commands: `test`, `test:frontend`, `test:backend`, `test:e2e`

## References

- **[ROADMAP](docs/ROADMAP.md)** - Sprint progress tracking with checkboxes (UPDATE THIS!)
- [Project Plan](docs/PROJECT_PLAN.md) - Detailed implementation phases
- [Frontend MEMORY](services/frontend/webapp/MEMORY.md) - Frontend-specific guidance
- [Backend MEMORY](services/backend/MEMORY.md) - Backend-specific guidance
- [Infrastructure MEMORY](infra/MEMORY.md) - Deployment and CI/CD guidance
- [Scripts MEMORY](scripts/MEMORY.md) - Developer commands reference
- [Tests MEMORY](tests/MEMORY.md) - Testing strategy and deployment verification
- Context7 - Latest best practices and examples

## Setup Reminder

If `setup.sh` hasn't been run yet, it needs to be created and executed to:

1. Install dependencies
2. Set up Firebase configuration
3. Create environment files
4. Initialize Docker containers
5. Set up git hooks
6. Load developer commands
