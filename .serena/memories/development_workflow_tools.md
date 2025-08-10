# Development Workflow Tools & Best Practices

## Context7 Integration for Best Practices

### When to Use Context7
Always consult Context7 for up-to-date documentation and best practices when working with:

- **Firebase SDK**: Authentication, Firestore, Functions, Storage
- **React**: Hooks, state management, routing
- **TypeScript**: Type definitions, best practices
- **Node.js**: Function development, async patterns
- **Security**: Firebase security rules, authentication patterns

### Context7 Usage Pattern
```bash
# Before implementing any feature, get latest best practices:
mcp__context7__resolve-library-id -> firebase
mcp__context7__get-library-docs -> specific Firebase service

# Example workflow:
# 1. Resolve library: "firebase functions"
# 2. Get docs for: "/firebase/firebase-functions" with topic: "authentication"
# 3. Implement using latest patterns from documentation
```

### Key Context7 Libraries to Reference
- **Firebase**: `/firebase/firebase` - Core Firebase SDK
- **Firebase Functions**: `/firebase/firebase-functions` - Cloud Functions
- **Firebase Admin**: `/firebase/firebase-admin` - Admin SDK
- **React**: `/facebook/react` - React patterns and hooks
- **TypeScript**: `/microsoft/typescript` - Type safety patterns
- **Express**: `/expressjs/express` - If using HTTP functions

## Advanced MCP Tools for Development

### Ref Tools - Documentation & Code Search
**Use Cases:**
- **Documentation Research**: Search across public/private docs, GitHub repos, PDFs
- **Code Pattern Discovery**: Find implementation examples in open-source projects  
- **API Reference Lookup**: Access up-to-date documentation for libraries/frameworks
- **Best Practice Research**: Discover coding patterns and conventions

**Workflow Integration:**
```bash
# Research documentation before implementing
mcp__ref-tools__ref_search_documentation: "Firebase authentication best practices"
mcp__ref-tools__ref_read_url: "https://docs.firebase.com/auth/guide"

# Find implementation examples
mcp__ref-tools__ref_search_documentation: "React Firebase hooks patterns"
# Include ref_src=private to search private docs when available
```

**Best For:**
- Pre-implementation research phases
- Learning new APIs or libraries
- Finding code examples and patterns
- Documentation-driven development

### Semgrep - Security & Code Quality Analysis
**Use Cases:**
- **Security Vulnerability Detection**: Identify security issues before deployment
- **Code Quality Assessment**: Find bugs, performance issues, maintainability problems
- **Custom Rule Enforcement**: Define project-specific coding standards
- **Compliance Verification**: Ensure code meets security/regulatory requirements

**Workflow Integration:**
```bash
# Security check before commits
mcp__semgrep__security_check: [list of code files]

# Full scan with specific config
mcp__semgrep__semgrep_scan: {code_files: [...], config: "p/security"}

# Custom rule for project standards
mcp__semgrep__semgrep_scan_with_custom_rule: {rule: "custom_yaml_rule", code_files: [...]}

# Get findings from Semgrep platform
mcp__semgrep__semgrep_findings: {status: "open", severities: ["critical", "high"]}
```

**Supported Languages:**
TypeScript, JavaScript, Python, Go, Java, C/C++, Rust, PHP, Ruby, Bash, and 40+ others

**Best For:**
- Pre-commit security validation
- Code review automation  
- Continuous security monitoring
- Technical debt identification

### Exa AI - Intelligent Web Search & Research
**Use Cases:**
- **Deep Research Tasks**: Comprehensive topic investigation with citations
- **Company Intelligence**: Business research, competitor analysis
- **Technical Documentation**: Find specific technical solutions
- **LinkedIn & Professional Search**: Recruitment, networking research

**Workflow Integration:**
```bash
# Quick web search
mcp__exa__web_search_exa: {query: "Firebase v9 migration guide", numResults: 5}

# Company research  
mcp__exa__company_research_exa: {companyName: "OpenAI", numResults: 3}

# Deep research with AI analysis
mcp__exa__deep_researcher_start: {instructions: "Research latest trends in serverless architecture"}
mcp__exa__deep_researcher_check: {taskId: "research_task_id"}

# Professional networking
mcp__exa__linkedin_search_exa: {query: "TypeScript developer San Francisco", searchType: "profiles"}

# Content extraction
mcp__exa__crawling_exa: {url: "https://example.com/article", maxCharacters: 3000}
```

**Search Types:**
- **Neural Search**: Semantic understanding of queries
- **Auto Search**: Combines keyword and neural approaches  
- **Professional Search**: LinkedIn-optimized results
- **Deep Research**: AI-powered comprehensive analysis

**Best For:**
- Market research and competitive analysis
- Technical solution discovery
- Content research and fact-checking
- Professional networking and recruitment

### Playwright MCP - Browser Automation & Testing
**Use Cases:**
- **E2E Testing**: Automated testing of web applications
- **Web Scraping**: Data extraction from dynamic websites
- **UI Interaction**: Automated form filling, clicking, navigation
- **Visual Regression**: Screenshot-based testing
- **Accessibility Testing**: Automated accessibility validation

**Workflow Integration:**
```bash
# Navigate and take screenshots
mcp__playwright__browser_navigate: {url: "https://myapp.com"}
mcp__playwright__browser_take_screenshot: {fullPage: true}

# Page interaction
mcp__playwright__browser_click: {element: "login button", ref: "element_ref"}
mcp__playwright__browser_type: {element: "email field", text: "user@example.com"}

# Form automation
mcp__playwright__browser_select_option: {element: "dropdown", values: ["option1"]}

# Accessibility snapshot
mcp__playwright__browser_snapshot: {} # Better than screenshot for interaction

# Multi-tab management
mcp__playwright__browser_tab_new: {url: "https://newpage.com"}
mcp__playwright__browser_tab_select: {index: 1}
```

**Key Capabilities:**
- **Accessibility Tree Integration**: Uses Chrome's accessibility tree for reliable element interaction
- **Cross-browser Testing**: Chrome, Firefox, Safari support
- **Network Monitoring**: Track API calls and requests
- **File Operations**: Upload/download file handling
- **Mobile Simulation**: Device and viewport emulation

**Best For:**
- Automated testing workflows
- Quality assurance validation
- User journey automation
- Web scraping and data collection
- Accessibility compliance testing

## GitHub Operations with gh CLI

### Use gh instead of git for GitHub operations

#### Repository Management
```bash
# Create repository (if needed)
gh repo create portfolio-website --private

# Clone repository
gh repo clone owner/portfolio-website

# View repository information
gh repo view

# Set repository visibility
gh repo edit --visibility private
```

#### Issues and Project Management
```bash
# List issues
gh issue list

# Create issue
gh issue create --title "Implement Firebase authentication" --body "Set up Google Sign-in with domain restriction"

# View issue
gh issue view 123

# Close issue
gh issue close 123
```

#### Pull Request Workflow
```bash
# Create pull request
gh pr create --title "feat: implement contact form backend" --body "- Add sendContactEmail function
- Configure email notifications
- Add rate limiting for submissions"

# List pull requests
gh pr list

# Review pull request
gh pr view 123
gh pr review 123 --approve

# Merge pull request
gh pr merge 123 --squash
```

#### Branches and Releases
```bash
# Create branch
git checkout -b feature/firebase-auth
gh pr create --draft  # Create draft PR immediately

# Push and create PR in one command
gh pr create --title "WIP: Firebase authentication setup"

# Create release
gh release create v1.0.0 --title "Initial Firebase Backend" --notes "Complete Firebase authentication and basic collections"
```

## Git Commit Configuration

### Author Information
**Important**: Use the following author information for all commits:

```bash
# Set global git configuration
git config --global user.name "Jose J Lopez"
git config --global user.email "JL@josejlopez.com"

# Verify configuration
git config --global user.name
git config --global user.email
```

### Commit Message Format
Use conventional commit format with proper attribution:

```bash
# Standard commit format
git commit -m "feat: implement Firebase authentication

- Add Google Sign-in with domain restriction
- Create admin verification system  
- Implement security rules for admin collection
- Add TypeScript interfaces for auth state

Authored-by: Jose J Lopez <JL@josejlopez.com>"

# For collaborative commits (when Claude assists)
git commit -m "feat: implement contact form backend

- Add sendContactEmail Cloud Function
- Configure Nodemailer for email notifications
- Add rate limiting for form submissions
- Update Firestore security rules

Co-authored-by: Claude <noreply@anthropic.com>
Authored-by: Jose J Lopez <JL@josejlopez.com>"
```

### Commit Types
Follow conventional commit standards:
- **feat**: New feature implementation
- **fix**: Bug fixes
- **docs**: Documentation updates
- **style**: Code style/formatting changes
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, config updates

## Integrated Development Workflow

### Feature Development Process
1. **Research with Context7**: Get latest best practices for the technology
2. **Create GitHub Issue**: Document what you're building
3. **Create Branch**: Feature branch with descriptive name
4. **Implement**: Using Context7 guidance and Firebase MCP tools
5. **Test**: Firebase emulators and validation
6. **Commit**: Proper attribution to Jose J Lopez
7. **Create PR**: Using gh cli with detailed description
8. **Review & Merge**: Through GitHub interface

### Example Complete Workflow
```bash
# 1. Research best practices
# Use Context7 to get Firebase Functions best practices

# 2. Create issue and branch
gh issue create --title "Implement email notifications for contact form"
git checkout -b feature/email-notifications

# 3. Implement feature
# (Use Firebase MCP tools and Context7 guidance)

# 4. Test with emulators
firebase emulators:start --only functions,firestore

# 5. Commit with proper attribution  
git add .
git commit -m "feat: implement email notifications for contact form

- Add sendContactEmail Cloud Function with Nodemailer
- Configure Gmail SMTP with environment variables
- Add rate limiting to prevent spam
- Update security rules for messages collection

Authored-by: Jose J Lopez <JL@josejlopez.com>"

# 6. Create pull request
git push origin feature/email-notifications
gh pr create --title "feat: implement email notifications for contact form" --body "## Summary
- Adds Cloud Function for sending email notifications
- Implements rate limiting for security
- Configures SMTP with Gmail

## Testing
- Tested with Firebase emulators
- Verified email delivery in development
- Confirmed rate limiting works correctly

Closes #123"

# 7. Merge when ready
gh pr merge --squash
```

## Context7 Best Practice Patterns

### Before Major Implementation
Always check Context7 for:
- **Latest API patterns** for the specific service
- **Security best practices** for authentication/authorization
- **Performance optimization** techniques
- **Error handling** patterns
- **Testing strategies** for the technology

### Context7 Query Examples
```bash
# Get Firebase Functions best practices
resolve-library-id: "firebase functions"
get-library-docs: "/firebase/firebase-functions" topic: "best practices"

# Get React authentication patterns
resolve-library-id: "react authentication"  
get-library-docs: "/facebook/react" topic: "authentication"

# Get TypeScript interface patterns
resolve-library-id: "typescript interfaces"
get-library-docs: "/microsoft/typescript" topic: "interfaces"
```

## Quality Assurance with Tools

### Enhanced Pre-commit Checklist
1. **Context7 Review**: Verify implementation follows latest best practices
2. **Ref Tools Research**: Validate against current documentation
3. **Semgrep Security Scan**: Run comprehensive security analysis
4. **Firebase MCP Validation**: Test all Firebase operations
5. **Playwright E2E Tests**: Automated user journey validation
6. **TypeScript Compilation**: Ensure no type errors
7. **Emulator Testing**: Verify functionality works locally
8. **Security Review**: Check rules and permissions
9. **Git Attribution**: Ensure Jose J Lopez is credited as author
10. **GitHub Integration**: Use gh cli for all GitHub operations

### Comprehensive Testing Strategy
```bash
# Security and quality analysis
mcp__semgrep__security_check: [modified_files]

# Research latest patterns
mcp__ref-tools__ref_search_documentation: "technology_name best practices 2024"

# Automated UI testing
mcp__playwright__browser_navigate: {url: "http://localhost:3000"}
# ... playwright testing commands

# Deep research for complex features
mcp__exa__deep_researcher_start: {instructions: "Best practices for feature_name implementation"}
```

### Documentation Updates
When implementing features:
1. **Update Serena memories** with new patterns learned
2. **Reference Context7 documentation** used in implementation
3. **Document GitHub workflow** decisions
4. **Update suggested commands** with new patterns

This integrated approach ensures:
- ✅ **Latest best practices** through Context7 and Ref Tools
- ✅ **Security validation** with Semgrep analysis
- ✅ **Comprehensive research** using Exa AI
- ✅ **Automated testing** with Playwright MCP
- ✅ **Proper attribution** to Jose J Lopez
- ✅ **Efficient GitHub workflow** with gh cli
- ✅ **Quality assurance** at every step