# Portfolio Website Project Overview

## Purpose
A modern, full-stack portfolio website with comprehensive admin dashboard capabilities. Built with Firebase backend-first approach, featuring:

- **Public Portfolio**: Project showcase, resume viewer, contact form
- **Admin Dashboard**: Content management, analytics, file uploads, user management
- **Real-time Features**: Live analytics, instant content updates
- **Authentication**: Google Sign-in with domain restriction for admin access

## Architecture Philosophy
**Backend-First Approach**: Starting with Firebase infrastructure to establish:
1. Authentication & authorization system
2. Firestore database with security rules
3. Cloud Functions for server-side logic
4. Firebase Storage for file management
5. Analytics and monitoring

## Tech Stack

### Backend (Primary Focus)
- **Firebase Firestore**: NoSQL database for all content and analytics
- **Firebase Authentication**: Google Sign-in with domain restriction
- **Firebase Functions**: Node.js serverless functions for email, analytics
- **Firebase Storage**: File uploads (resume PDFs, project images)
- **Firebase Hosting**: Static site hosting with custom domain support

### Frontend (Secondary Phase)
- **React 18+** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for server state management

### Development Tools
- **Firebase Emulators**: Local development environment
- **Firebase MCP**: Claude Code integration for Firebase operations
- **TypeScript**: Type safety across the stack

## Key Features
1. **Domain-Restricted Admin Access**: Only specific Google Workspace users
2. **Content Management**: CRUD operations for projects, resume, settings
3. **Analytics Dashboard**: Custom analytics beyond Google Analytics
4. **File Upload System**: Resume PDFs, project images with automatic optimization
5. **Email Notifications**: Contact form submissions via Cloud Functions
6. **Real-time Updates**: Live content changes via Firestore listeners

## Project Structure Focus
```
/functions/          # Firebase Cloud Functions (Node.js/TypeScript)
/firestore.rules     # Database security rules
/storage.rules       # File storage security rules
/firebase.json       # Firebase project configuration
/firestore.indexes.json # Database index definitions
```