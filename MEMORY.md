# PROJECT URIEL - MEMORY

## Close Out Ticket Process

**Key Phrase**: "close out ticket"

When user says "close out ticket", execute this workflow:

1. **Update Documentation & Memory**
   - Update relevant MEMORY.md files with new patterns/learnings
   - Update any documentation files affected by the work

2. **Commit & Push**
   - Create comprehensive commit with proper message format
   - Include 🤖 Generated with Claude Code footer
   - Push to current feature branch

3. **Merge to Sprint Branch**
   - Merge feature branch to sprint branch
   - Clean up merged feature branch

4. **Update Jira Ticket**
   - Add detailed completion comment with what was accomplished
   - Include key deliverables and verification steps

5. **Transition Tickets**
   - Move current ticket from In Progress → Done
   - Move next ticket from Pending → In Progress

6. **Create New Branch**
   - Create new feature branch for next ticket
   - Use format: `feature/PU-X-ticket-name`

7. **Update Roadmap**
   - Update progress percentages
   - Mark current task as completed
   - Update "Current Focus" section with next task
   - Add completion notes

## Firebase Emulator Configuration Patterns

### Security Rules Architecture
- Use helper functions for common auth checks (`isAuthenticated()`, `isAdmin()`, `isOwner()`)
- Implement RBAC with admin/user/public permission levels
- Collection-specific rules for portfolio data (projects, blog, experience, messages)
- Defensive security with explicit denials

### Firestore Indexes Strategy
- Composite indexes for sorting + filtering combinations
- Array-contains indexes for tags/technologies
- Collection group indexes for subcollections
- Field overrides for array fields

### Cloud Functions Structure
- TypeScript-first with strict type checking
- Modular function organization (contact, blog, analytics)
- Proper error handling with HttpsError
- SendGrid integration for email functionality

### Docker Volume Mounting
- Mount backend files as read-only volumes at runtime
- Avoid copying files at build time for faster rebuilds
- Use proper volume persistence for emulator data
- Health checks for container readiness

### Development Workflow
- Use `up`/`down` commands for service management
- `rebuild:docker` for clean container rebuilds
- Fixed `nuke` command for complete environment reset
- Firebase UI at localhost:4000 for testing

## Key Commands

```bash
# Start services
source activate && up

# Rebuild everything
rebuild:docker

# Nuclear option (fixed)
nuke  # Type "nuke everything" to confirm

# Test emulators
curl http://localhost:4000  # UI
curl http://localhost:8080  # Firestore
```

## Security Rules Testing
- Verify custom rules loaded vs default rules
- Check function count in security rules API response
- Test UI accessibility and emulator health status
- Validate file mounting in Docker containers

*Last Updated: July 2025 - PU-4 Completion*