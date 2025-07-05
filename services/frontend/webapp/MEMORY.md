# Frontend Service Memory

This document provides specific guidance for working with the React frontend application in Project Uriel.

## Tech Stack Details

### Core Technologies
- **React 18.2+** - Latest concurrent features, Suspense, and automatic batching
- **TypeScript 5.3+** - Strict mode enabled with comprehensive type checking
- **Vite 5+** - Lightning-fast HMR and optimized production builds
- **Tailwind CSS 3.4+** - JIT compiler, custom design system
- **React Router 6.20+** - Type-safe routing with data loaders

### State Management Architecture
- **React Context API** for global state (auth, theme, user preferences)
- **TanStack Query (React Query)** for server state and caching
- **Zustand** for complex client state if needed
- **Local Storage** for persistence with encryption for sensitive data

### Testing Stack
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **Playwright** - E2E testing
- **Storybook** - Component documentation and visual testing

## Project Structure

```
services/frontend/webapp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Modal, etc.)
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   └── features/       # Feature-specific components
│   ├── features/           # Feature modules (blog, portfolio, etc.)
│   │   └── [feature]/
│   │       ├── components/ # Feature-specific components
│   │       ├── hooks/      # Feature-specific hooks
│   │       ├── api/        # API calls for the feature
│   │       └── types/      # TypeScript types
│   ├── hooks/              # Global custom hooks
│   ├── lib/                # Utilities and helpers
│   │   ├── firebase/       # Firebase configuration and helpers
│   │   ├── api/           # API client setup
│   │   └── utils/         # General utilities
│   ├── pages/             # Route components (lazy loaded)
│   ├── services/          # Business logic and API services
│   ├── styles/            # Global styles and Tailwind config
│   ├── types/             # Global TypeScript definitions
│   └── test/              # Test utilities and setup
├── public/                # Static assets
├── .env.example           # Environment variables template
├── index.html            
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Critical Implementation Guidelines

### 1. Always Reference Context7
- **MANDATORY**: Check context7 for React 18+ patterns and best practices
- Use context7 for performance optimization techniques
- Follow context7 security guidelines for frontend applications
- Reference context7 for accessibility (a11y) standards

### 2. Component Development Standards

```typescript
// Always use functional components with TypeScript
interface ComponentProps {
  title: string;
  isActive?: boolean;
  onAction: (id: string) => void;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  isActive = false,
  onAction 
}) => {
  // Use custom hooks for logic separation
  const { data, isLoading } = useComponentData();
  
  // Early returns for loading/error states
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="p-4 rounded-lg shadow-md">
      {/* Component JSX */}
    </div>
  );
};
```

### 3. Firebase Integration Patterns

```typescript
// Always use custom hooks for Firebase operations
export const useFirebaseData = <T>(
  collection: string,
  filters?: QueryConstraint[]
) => {
  return useQuery({
    queryKey: ['firebase', collection, filters],
    queryFn: () => fetchFromFirestore<T>(collection, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 4. Performance Optimization Checklist
- [ ] Use React.lazy() for route-based code splitting
- [ ] Implement React.memo() for expensive components
- [ ] Use useMemo() and useCallback() appropriately
- [ ] Enable React DevTools Profiler in development
- [ ] Implement virtual scrolling for long lists
- [ ] Use Suspense boundaries for async components
- [ ] Optimize images with next-gen formats (WebP, AVIF)
- [ ] Implement proper loading states
- [ ] Use skeleton screens instead of spinners
- [ ] Preload critical resources

### 5. Security Requirements
- Never store sensitive data in localStorage without encryption
- Sanitize all user inputs before rendering
- Use Content Security Policy (CSP) headers
- Implement proper CORS handling
- Validate all data from Firebase
- Use environment variables for configuration
- Never expose Firebase config in production builds
- Implement rate limiting on client-side API calls

### 6. Styling Best Practices
```css
/* Use Tailwind CSS utility classes */
/* Custom components should follow this pattern */
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg 
         hover:bg-blue-700 focus:outline-none focus:ring-2 
         focus:ring-blue-500 focus:ring-offset-2
         transition-colors duration-200;
}

/* Use CSS variables for theme customization */
:root {
  --color-primary: theme('colors.blue.600');
  --color-secondary: theme('colors.gray.600');
}
```

### 7. Testing Requirements
```typescript
// Example test structure
describe('Component', () => {
  it('should render with required props', () => {
    render(<Component title="Test" onAction={vi.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    const handleAction = vi.fn();
    render(<Component title="Test" onAction={handleAction} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalledWith(expect.any(String));
  });
});
```

## Development Workflow

### 1. Feature Development Process
1. Create feature branch: `git checkout -b feature/feature-name`
2. Create feature folder structure
3. Write tests first (TDD)
4. Implement component with TypeScript
5. Add Storybook stories
6. Test with Firebase emulators
7. Run performance audit
8. Create PR with screenshots

### 2. Pre-commit Checklist
- [ ] TypeScript compilation passes (`tsc --noEmit`)
- [ ] All tests pass (`npm test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatted (`npm run format`)
- [ ] No console.logs in code
- [ ] Bundle size checked
- [ ] Lighthouse score >95

### 3. Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run dev:host        # Expose to network

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run e2e             # Playwright tests

# Building
npm run build           # Production build
npm run preview         # Preview build
npm run analyze         # Bundle analysis

# Code Quality
npm run lint            # ESLint
npm run format          # Prettier
npm run type-check      # TypeScript
```

## Firebase-Specific Patterns

### 1. Authentication Flow
```typescript
// Always use AuthContext
const { user, isLoading } = useAuth();

// Protected routes pattern
<Route element={<ProtectedRoute />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

### 2. Firestore Queries
```typescript
// Use type-safe queries
interface Project {
  id: string;
  title: string;
  technologies: string[];
  featured: boolean;
}

const projects = await queryFirestore<Project>('projects', [
  where('featured', '==', true),
  orderBy('createdAt', 'desc'),
  limit(10)
]);
```

### 3. Real-time Updates
```typescript
// Implement proper cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'messages')),
    (snapshot) => {
      // Handle updates
    }
  );
  
  return () => unsubscribe();
}, []);
```

## Performance Monitoring

### 1. Web Vitals Tracking
- Implement Core Web Vitals monitoring
- Track custom metrics for key user flows
- Set up alerts for performance regressions

### 2. Bundle Size Limits
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        firebase: ['firebase/app', 'firebase/auth'],
      }
    }
  }
}
```

### 3. Image Optimization
- Use responsive images with srcset
- Implement lazy loading with Intersection Observer
- Convert images to WebP format
- Use Firebase Storage image transformation

## Deployment Considerations

### 1. Environment Variables
```bash
# Required for production
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SENTRY_DSN=
VITE_GA_MEASUREMENT_ID=
```

### 2. Build Optimization
- Enable tree shaking
- Minify CSS and JavaScript
- Generate source maps for error tracking
- Implement service worker for offline support

### 3. CDN Configuration
- Use Firebase Hosting CDN
- Set proper cache headers
- Implement cache busting for assets
- Use preconnect for third-party domains

## Troubleshooting Guide

### Common Issues
1. **HMR not working**: Check Vite config and WSL2 settings
2. **Firebase connection errors**: Verify emulator ports
3. **TypeScript errors**: Run `npm run type-check`
4. **Build failures**: Check for circular dependencies

### Debug Commands
```bash
# Check bundle size
npm run build -- --analyze

# Debug Firebase connection
localStorage.setItem('debug', 'firebase:*')

# Profile React performance
window.React_Profiler_Enable = true
```

## References
- Always check context7 for latest patterns
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)