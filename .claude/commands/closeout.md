# Close Out Ticket

Execute complete ticket closeout workflow:

1. Update MEMORY.md files with new patterns
2. Commit & push with proper message format
3. Merge to sprint branch with --no-ff
4. Update Jira ticket with completion details  
5. Transition tickets (current → Done, next → In Progress)
6. Create new feature branch from sprint branch
7. Update ROADMAP.md progress
8. Clear completed todos

Automatically runs entire process without stopping for confirmation.