import { test, expect } from '@playwright/test';

test.describe('Admin Login E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should login admin user successfully', async ({ page }) => {
    // Navigate to login page
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/login');

    // Fill admin credentials
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');

    // Submit login
    await page.click('[data-testid="login-submit"]');

    // Wait for login to complete
    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Verify admin dashboard is accessible
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();

    // Verify admin navigation menu
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
  });

  test('should show admin role indicator', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Verify admin role badge
    await expect(page.locator('[data-testid="role-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('Admin');
    await expect(page.locator('[data-testid="role-badge"]')).toHaveClass(/admin/);

    // Verify admin privileges indicator
    await expect(page.locator('[data-testid="admin-privileges"]')).toBeVisible();
  });

  test('should handle admin user management', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Navigate to user management
    await page.click('[data-testid="users-management"]');
    await expect(page).toHaveURL('/admin/users');

    // Verify user list is visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Test create new user
    await page.click('[data-testid="create-user-button"]');
    await expect(page.locator('[data-testid="create-user-modal"]')).toBeVisible();

    await page.fill('[data-testid="new-user-email"]', 'newuser@example.com');
    await page.fill('[data-testid="new-user-password"]', 'TempPassword123!');
    await page.fill('[data-testid="new-user-name"]', 'New User');
    await page.selectOption('[data-testid="new-user-role"]', 'user');

    await page.click('[data-testid="create-user-submit"]');

    // Verify user was created
    await expect(page.locator('[data-testid="user-created-success"]')).toBeVisible();
    
    // Verify new user appears in list
    await expect(page.locator('[data-testid="users-table"]')).toContainText('newuser@example.com');
  });

  test('should handle role updates', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');
    await page.click('[data-testid="users-management"]');

    // Find a user to update
    const userRow = page.locator('[data-testid="user-row"]').first();
    await userRow.locator('[data-testid="edit-user-button"]').click();

    await expect(page.locator('[data-testid="edit-user-modal"]')).toBeVisible();

    // Change user role
    await page.selectOption('[data-testid="edit-user-role"]', 'admin');
    
    // Confirm role change
    await page.click('[data-testid="update-role-submit"]');
    
    // Should show confirmation dialog for admin promotion
    await expect(page.locator('[data-testid="role-change-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-change-confirmation"]')).toContainText('promote to admin');
    
    await page.click('[data-testid="confirm-role-change"]');

    // Verify success
    await expect(page.locator('[data-testid="role-updated-success"]')).toBeVisible();
  });

  test('should handle content management', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Navigate to content management
    await page.click('[data-testid="content-management"]');
    await expect(page).toHaveURL('/admin/content');

    // Test project management
    await page.click('[data-testid="projects-tab"]');
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();

    // Create new project
    await page.click('[data-testid="create-project-button"]');
    await expect(page.locator('[data-testid="project-form"]')).toBeVisible();

    await page.fill('[data-testid="project-title"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'This is a test project');
    await page.fill('[data-testid="project-technologies"]', 'React, TypeScript, Firebase');
    await page.check('[data-testid="project-featured"]');

    await page.click('[data-testid="save-project"]');

    // Verify project was created
    await expect(page.locator('[data-testid="project-created-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="projects-list"]')).toContainText('Test Project');

    // Test blog management
    await page.click('[data-testid="blog-tab"]');
    await expect(page.locator('[data-testid="blog-posts-list"]')).toBeVisible();

    // Create new blog post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Test Blog Post');
    await page.fill('[data-testid="post-content"]', '# Test Post\n\nThis is a test blog post.');
    await page.selectOption('[data-testid="post-status"]', 'published');

    await page.click('[data-testid="save-post"]');

    await expect(page.locator('[data-testid="post-created-success"]')).toBeVisible();
  });

  test('should display analytics dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Navigate to analytics
    await page.click('[data-testid="analytics-dashboard"]');
    await expect(page).toHaveURL('/admin/analytics');

    // Verify analytics widgets
    await expect(page.locator('[data-testid="total-users-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-views-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-messages-widget"]')).toBeVisible();

    // Verify charts are loaded
    await expect(page.locator('[data-testid="users-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="traffic-chart"]')).toBeVisible();

    // Test date range picker
    await page.click('[data-testid="date-range-picker"]');
    await page.click('[data-testid="last-30-days"]');
    
    // Charts should update
    await page.waitForSelector('[data-testid="charts-loading"]', { state: 'hidden' });
    await expect(page.locator('[data-testid="users-chart"]')).toBeVisible();
  });

  test('should handle contact messages management', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Navigate to messages
    await page.click('[data-testid="messages-management"]');
    await expect(page).toHaveURL('/admin/messages');

    // Verify messages list
    await expect(page.locator('[data-testid="messages-table"]')).toBeVisible();

    // Test message status updates
    const messageRow = page.locator('[data-testid="message-row"]').first();
    await messageRow.locator('[data-testid="message-status-select"]').selectOption('read');

    // Verify status update
    await expect(messageRow.locator('[data-testid="message-status"]')).toContainText('Read');

    // Test message details
    await messageRow.locator('[data-testid="view-message-button"]').click();
    await expect(page.locator('[data-testid="message-details-modal"]')).toBeVisible();

    // Test reply functionality
    await page.click('[data-testid="reply-button"]');
    await page.fill('[data-testid="reply-content"]', 'Thank you for your message!');
    await page.click('[data-testid="send-reply"]');

    await expect(page.locator('[data-testid="reply-sent-success"]')).toBeVisible();
  });

  test('should prevent non-admin access to admin areas', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="user-dashboard"]');

    // Try to access admin areas directly
    await page.goto('/admin/dashboard');
    
    // Should redirect to unauthorized page or user dashboard
    await expect(page).toHaveURL(/\/(unauthorized|dashboard)/);
    
    if (await page.locator('[data-testid="unauthorized-message"]').isVisible()) {
      await expect(page.locator('[data-testid="unauthorized-message"]')).toContainText('Access denied');
    }

    // Admin navigation should not be visible
    await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
  });

  test('should handle admin logout properly', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Try to access admin area after logout
    await page.goto('/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Should show authentication required message
    await expect(page.locator('[data-testid="auth-required-message"]')).toBeVisible();
  });

  test('should handle session timeout', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');

    // Simulate session expiration by manipulating token
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'expired-token');
    });

    // Try to perform admin action
    await page.click('[data-testid="users-management"]');

    // Should detect expired session
    await expect(page.locator('[data-testid="session-expired-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-expired-modal"]')).toContainText('Session expired');

    // Should provide option to login again
    await page.click('[data-testid="login-again-button"]');
    await expect(page).toHaveURL('/login');
  });

  test('should show admin action confirmations', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@projecturiel.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-submit"]');

    await page.waitForSelector('[data-testid="admin-dashboard"]');
    await page.click('[data-testid="users-management"]');

    // Test delete user confirmation
    const userRow = page.locator('[data-testid="user-row"]').first();
    await userRow.locator('[data-testid="delete-user-button"]').click();

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText('Are you sure');

    // Cancel deletion
    await page.click('[data-testid="cancel-delete"]');
    await expect(page.locator('[data-testid="delete-confirmation"]')).not.toBeVisible();

    // Try again and confirm
    await userRow.locator('[data-testid="delete-user-button"]').click();
    await page.click('[data-testid="confirm-delete"]');

    await expect(page.locator('[data-testid="user-deleted-success"]')).toBeVisible();
  });
});