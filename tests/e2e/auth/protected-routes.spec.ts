import { test, expect } from '@playwright/test';

test.describe('Protected Routes E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/admin/dashboard',
      '/admin/users',
      '/admin/content',
      '/admin/analytics'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login');
      
      // Should show authentication required message
      await expect(page.locator('[data-testid="auth-required"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-required"]')).toContainText('Please log in');
      
      // Should remember the intended destination
      const returnUrl = new URL(page.url()).searchParams.get('returnUrl');
      expect(returnUrl).toBe(route);
    }
  });

  test('should allow authenticated users to access user routes', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Test accessible user routes
    const userRoutes = [
      { path: '/dashboard', testId: 'user-dashboard' },
      { path: '/profile', testId: 'user-profile' },
      { path: '/settings', testId: 'user-settings' }
    ];

    for (const route of userRoutes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(route.path);
      await expect(page.locator(`[data-testid="${route.testId}"]`)).toBeVisible();
    }
  });

  test('should block regular users from admin routes', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Try to access admin routes
    const adminRoutes = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/content',
      '/admin/analytics',
      '/admin/messages'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should redirect to unauthorized page or user dashboard
      await expect(page).toHaveURL(/\/(unauthorized|dashboard)/);
      
      if (await page.locator('[data-testid="access-denied"]').isVisible()) {
        await expect(page.locator('[data-testid="access-denied"]')).toContainText('Access denied');
        await expect(page.locator('[data-testid="insufficient-permissions"]')).toContainText('Admin role required');
      }
    }
  });

  test('should allow admin users to access all routes', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Test all accessible routes for admin
    const allRoutes = [
      { path: '/dashboard', testId: 'user-dashboard' },
      { path: '/profile', testId: 'user-profile' },
      { path: '/admin/dashboard', testId: 'admin-dashboard' },
      { path: '/admin/users', testId: 'users-management' },
      { path: '/admin/content', testId: 'content-management' },
      { path: '/admin/analytics', testId: 'analytics-dashboard' }
    ];

    for (const route of allRoutes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(route.path);
      await expect(page.locator(`[data-testid="${route.testId}"]`)).toBeVisible();
    }
  });

  test('should handle route navigation with authentication state', async ({ page }) => {
    // Start unauthenticated
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to originally requested page
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();

    // Test navigation while authenticated
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL('/profile');

    await page.click('[data-testid="dashboard-link"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle session expiration on protected routes', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    });

    // Try to navigate to protected route
    await page.goto('/profile');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="session-expired"]')).toBeVisible();
  });

  test('should handle role changes during session', async ({ page }) => {
    // Login as user who will be promoted to admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'promotable@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Initially should not have admin access
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/(unauthorized|dashboard)/);

    // Simulate role promotion (in real scenario, this would be done by another admin)
    await page.evaluate(() => {
      // Mock token refresh with new role
      localStorage.setItem('userRole', 'admin');
    });

    // Force token refresh (simulate what would happen on next API call)
    await page.reload();

    // Should now have admin access
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('should handle deep linking to protected routes', async ({ page }) => {
    // Direct access to deep admin route
    await page.goto('/admin/users/123/edit');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL('/login');
    const returnUrl = new URL(page.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe('/admin/users/123/edit');

    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to the originally requested deep route
    await expect(page).toHaveURL('/admin/users/123/edit');
    await expect(page.locator('[data-testid="edit-user-form"]')).toBeVisible();
  });

  test('should handle navigation guards with loading states', async ({ page }) => {
    // Mock slow authentication check
    await page.route('**/api/auth/verify', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/dashboard');

    // Should show loading state during auth check
    await expect(page.locator('[data-testid="auth-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-loading"]')).toContainText('Checking authentication');

    // Should eventually redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="auth-loading"]')).not.toBeVisible();
  });

  test('should handle concurrent route protection checks', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Quickly navigate between multiple protected routes
    const routes = ['/profile', '/settings', '/dashboard', '/profile'];
    
    for (const route of routes) {
      await page.goto(route);
      // Don't wait for full load, just verify no errors
      await page.waitForTimeout(100);
    }

    // Should end up on the last route without errors
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('should handle route protection with query parameters', async ({ page }) => {
    // Try to access protected route with query parameters
    await page.goto('/admin/users?tab=active&sort=email');
    
    // Should redirect to login preserving query params in return URL
    await expect(page).toHaveURL('/login');
    const returnUrl = new URL(page.url()).searchParams.get('returnUrl');
    expect(returnUrl).toBe('/admin/users?tab=active&sort=email');

    // Login as admin
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    // Should redirect to route with preserved query parameters
    await expect(page).toHaveURL('/admin/users?tab=active&sort=email');
    
    // Verify query parameters are applied
    await expect(page.locator('[data-testid="active-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="sort-email"]')).toHaveClass(/selected/);
  });

  test('should show appropriate navigation based on user role', async ({ page }) => {
    // Test regular user navigation
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // User navigation should be limited
    await expect(page.locator('[data-testid="dashboard-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-link"]')).not.toBeVisible();

    // Logout and login as admin
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Admin should see all navigation options
    await expect(page.locator('[data-testid="dashboard-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-nav-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-nav-link"]')).toBeVisible();
  });

  test('should handle browser back/forward with protected routes', async ({ page }) => {
    // Start at public page
    await page.goto('/');
    
    // Try to go to protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Navigate to another protected page
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });
});