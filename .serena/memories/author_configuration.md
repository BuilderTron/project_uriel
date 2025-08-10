# Git Author Configuration

## Primary Author Information
**All commits must be attributed to:**

- **Name**: Jose J Lopez
- **Email**: JL@josejlopez.com

## Git Configuration Setup
```bash
# Set global git configuration (run once)
git config --global user.name "Jose J Lopez"
git config --global user.email "JL@josejlopez.com"

# Verify configuration
git config --global user.name
git config --global user.email
```

## Commit Attribution Patterns

### Standard Commits (Your Work)
```bash
git commit -m "feat: implement Firebase authentication system

- Add Google Sign-in with domain restriction
- Create admin verification in Firestore
- Implement security rules for admin collection
- Add TypeScript interfaces for authentication state

Authored-by: Jose J Lopez <JL@josejlopez.com>"
```

### Collaborative Commits (When Claude Assists)
```bash
git commit -m "feat: implement contact form backend with email notifications

- Add sendContactEmail Cloud Function using Context7 best practices
- Configure Nodemailer with Gmail SMTP integration
- Add rate limiting for form submission security
- Update Firestore security rules for messages collection
- Implement input validation and sanitization

Co-authored-by: Claude <noreply@anthropic.com>
Authored-by: Jose J Lopez <JL@josejlopez.com>"
```

### Research/Documentation Commits
```bash
git commit -m "docs: update Firebase architecture documentation

- Add comprehensive Firestore collection schemas
- Document security rules implementation
- Include Context7 best practices references
- Update deployment checklist procedures

Authored-by: Jose J Lopez <JL@josejlopez.com>"
```

## GitHub Integration

### Issues and PRs
When using gh CLI, always ensure proper attribution:

```bash
# Create issues
gh issue create --title "Implement user authentication" --assignee josejlopez

# Create PRs with detailed attribution
gh pr create --title "feat: Firebase authentication implementation" --body "## Summary
Complete Firebase authentication system with Google Sign-in

## Implementation Details
- Followed Context7 Firebase Auth best practices
- Added domain restriction for admin access
- Implemented comprehensive security rules
- Added TypeScript type safety

## Testing
- Tested with Firebase emulators
- Verified security rules with unauthorized access attempts
- Confirmed admin verification workflow

**Author**: Jose J Lopez (JL@josejlopez.com)
**Implementation**: Following Context7 Firebase documentation"
```

## Repository Ownership

### Repository Settings
- **Owner**: Jose J Lopez
- **Primary Contact**: JL@josejlopez.com
- **Collaborators**: Add Claude/AI assistants as needed

### License Attribution
If adding license file:
```
Copyright (c) 2024 Jose J Lopez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software")...

Author: Jose J Lopez <JL@josejlopez.com>
```

## Important Notes

### Never Use Claude's Default Attribution
❌ **Don't use**: 
```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

✅ **Always use**:
```
Authored-by: Jose J Lopez <JL@josejlopez.com>
```

### When Claude Significantly Assists
If Claude provides substantial implementation help:
```
Co-authored-by: Claude <noreply@anthropic.com>
Authored-by: Jose J Lopez <JL@josejlopez.com>
```

### Package.json Author Field
```json
{
  "name": "portfolio-website",
  "version": "1.0.0",
  "author": {
    "name": "Jose J Lopez",
    "email": "JL@josejlopez.com",
    "url": "https://josejlopez.com"
  },
  "contributors": [
    {
      "name": "Jose J Lopez",
      "email": "JL@josejlopez.com"
    }
  ]
}
```

## Verification Commands

### Before Each Commit
```bash
# Verify git config
git config user.name
git config user.email

# Should output:
# Jose J Lopez
# JL@josejlopez.com
```

### Repository Attribution Check
```bash
# Check recent commits
git log --oneline -5 --pretty=format:"%h %s (%an)"

# Should show "Jose J Lopez" as author
```

This ensures proper attribution and ownership of all work in the portfolio project.