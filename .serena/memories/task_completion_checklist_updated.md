# Task Completion Checklist (Updated)

## When completing any development task in this Firebase portfolio project, follow this checklist:

## 🔍 Code Quality Checks

### Context7 Best Practices Review
```bash
# Before implementing, always check latest best practices
# Use Context7 to resolve library and get current documentation
# Example: resolve-library-id: "firebase functions"
# Then: get-library-docs with specific topic
```

### TypeScript Validation
```bash
# In functions directory
cd functions && npx tsc --noEmit

# If type errors, fix before proceeding
```

### Linting (when available)
```bash
# In functions directory
cd functions && npm run lint

# Fix any linting issues
```

### Function Building
```bash
# Ensure functions build successfully
cd functions && npm run build
```

## 🧪 Testing Requirements

### Firebase Emulator Testing
```bash
# Start emulators for testing
firebase emulators:start --only firestore,auth,functions,storage

# Test the specific functionality you implemented
# Verify through emulator UI at http://localhost:4000
```

### Security Rules Testing
```bash
# If you modified firestore.rules or storage.rules
firebase emulators:start --only firestore,storage

# Test both authorized and unauthorized access scenarios
# Verify rules work as expected
```

### Function Testing
```bash
# If you created/modified Cloud Functions
firebase emulators:start --only functions

# Test function execution through:
# - Direct HTTP calls
# - Firestore triggers
# - Authentication triggers
```

## 🚀 Deployment Checks

### Local Validation First
- Context7 best practices followed ✅
- All emulator tests pass ✅
- No TypeScript compilation errors ✅
- Functions build successfully ✅
- Security rules validate ✅

### Deployment Commands
```bash
# Deploy functions (if modified)
firebase deploy --only functions

# Deploy rules (if modified)
firebase deploy --only firestore:rules,storage

# Full deployment (use with caution)
firebase deploy
```

### Post-Deployment Verification
```bash
# Check function logs for errors
firebase functions:log

# Monitor function performance in console
# Verify database operations work in production
```

## 📊 Firebase MCP Integration Checks

### Validate Through MCP Tools
When working with Firebase operations, always validate through MCP:

```bash
# Test Firestore operations
firestore_get_documents
firestore_query_collection

# Test authentication
auth_list_users
auth_get_user

# Verify configurations
firebase_get_project
firebase_get_environment
```

## 📝 Documentation Updates

### Code Documentation
- Add TypeScript comments for complex functions
- Document Firebase rule changes
- Update interface definitions
- Reference Context7 documentation used

### Memory Updates
If you made significant architectural changes:
```bash
# Update relevant memory files through Serena
write_memory - Update implementation progress
write_memory - Document new patterns learned from Context7
```

## 🔒 Security Verification

### Authentication Testing
- Test admin domain restriction ✅
- Verify unauthorized access is blocked ✅
- Test admin privilege escalation ✅

### Data Privacy
- No sensitive data logged ✅
- API keys not exposed in client ✅
- Proper input sanitization ✅

### Rate Limiting (for public endpoints)
- Contact form rate limiting functional ✅
- Analytics tracking within limits ✅

## 🎯 Task-Specific Checklists

### For Firestore Changes
- [ ] Context7 consulted for Firestore best practices
- [ ] Security rules updated appropriately
- [ ] Indexes updated in firestore.indexes.json
- [ ] Data validation implemented
- [ ] Real-time listeners work correctly

### For Cloud Functions Changes
- [ ] Context7 consulted for Firebase Functions best practices
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Memory and timeout settings optimized

### For Authentication Changes
- [ ] Context7 consulted for Firebase Auth best practices
- [ ] Domain restriction working
- [ ] Admin verification functional
- [ ] Session management secure
- [ ] Logout process complete

### For Storage Changes
- [ ] Context7 consulted for Firebase Storage best practices
- [ ] File type restrictions working
- [ ] Size limits enforced
- [ ] Public access configured properly
- [ ] Admin upload permissions verified

## 🚨 Before Final Commit

### Critical Validations
1. **Context7 Best Practices**: Implementation follows latest documentation patterns
2. **No Secrets Committed**: Check for API keys, passwords, tokens
3. **Environment Variables**: All sensitive data in config, not code
4. **TypeScript Strict Mode**: All type errors resolved
5. **Security Rules**: Tested with both authorized and unauthorized users
6. **Function Performance**: No infinite loops or excessive resource usage

### Git Best Practices with Proper Attribution
```bash
# Stage changes carefully
git add -p  # Review each change

# Descriptive commit message with proper attribution
git commit -m "feat: implement contact form with email notifications

- Add sendContactEmail Cloud Function
- Configure rate limiting for submissions  
- Update Firestore rules for messages collection
- Add email notification via Nodemailer

Authored-by: Jose J Lopez <JL@josejlopez.com>"

# Push to feature branch and create PR with gh cli
git push origin feature/contact-form
gh pr create --title "feat: implement contact form backend" --body "Complete implementation with email notifications and security"
```

### GitHub Integration with gh CLI
```bash
# Create issue before starting work
gh issue create --title "Implement Firebase authentication" --body "Set up Google Sign-in with domain restriction"

# Create draft PR while working
gh pr create --draft --title "WIP: Firebase authentication setup"

# Update PR when ready for review
gh pr ready

# Merge when approved
gh pr merge --squash
```

## 🆘 If Something Breaks

### Emergency Rollback
```bash
# Rollback functions
firebase functions:delete functionName
# Redeploy previous version

# Rollback rules
# Revert firestore.rules to previous version
firebase deploy --only firestore:rules
```

### Debug Process
1. Check Firebase Console for error logs
2. Use `firebase functions:log` for function debugging
3. Test with emulators to isolate issues
4. Verify through MCP tools for systematic debugging
5. Consult Context7 for troubleshooting patterns

## ✅ Task Completion Confirmation

Only mark a task as complete when ALL of the following are verified:

- [ ] Context7 best practices consulted and followed
- [ ] Code compiles without errors
- [ ] All tests pass (emulator testing)
- [ ] Security rules prevent unauthorized access
- [ ] Functions deploy and execute successfully
- [ ] No sensitive data exposed
- [ ] Performance is acceptable
- [ ] Documentation is updated
- [ ] Git commit with proper attribution (Jose J Lopez)
- [ ] GitHub operations handled with gh cli
- [ ] GitHub issue/PR created and managed

**Remember**: Firebase changes affect production immediately in some cases. Always:
1. **Consult Context7** for latest best practices
2. **Test thoroughly** with emulators before deploying
3. **Use gh CLI** for all GitHub operations
4. **Ensure proper attribution** to Jose J Lopez in commits