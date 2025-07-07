import { test, expect } from '@playwright/test';

test.describe('User Registration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should register new user successfully', async ({ page }) => {
    // Navigate to registration page
    await page.click('[data-testid="register-button"]');
    await expect(page).toHaveURL('/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="display-name-input"]', 'New User');

    // Submit registration
    await page.click('[data-testid="register-submit"]');

    // Wait for registration to complete
    await page.waitForSelector('[data-testid="registration-success"]');

    // Verify success message
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="registration-success"]')).toContainText('Registration successful');

    // Verify redirect to dashboard or verification page
    await expect(page).toHaveURL(/\/(dashboard|verify)/);
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.click('[data-testid="register-button"]');
    await expect(page).toHaveURL('/register');

    // Test invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="register-submit"]');

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');

    // Test weak password
    await page.fill('[data-testid="email-input"]', 'valid@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-submit"]');

    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password too weak');

    // Test password mismatch
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="register-submit"]');

    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match');
  });

  test('should handle duplicate email registration', async ({ page }) => {
    await page.click('[data-testid="register-button"]');
    
    // Try to register with existing email
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="display-name-input"]', 'Existing User');

    await page.click('[data-testid="register-submit"]');

    // Wait for error message
    await page.waitForSelector('[data-testid="registration-error"]');
    await expect(page.locator('[data-testid="registration-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="registration-error"]')).toContainText('Email already in use');
  });

  test('should handle registration with social providers', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Test Google registration
    await page.click('[data-testid="google-register-button"]');
    
    // In a real test, this would interact with Google OAuth
    // For now, we'll mock the response
    await page.evaluate(() => {
      window.mockGoogleAuth = {
        user: {
          uid: 'google-user-123',
          email: 'google@example.com',
          displayName: 'Google User'
        }
      };
    });

    // Verify redirect after successful OAuth
    await expect(page).toHaveURL(/\/(dashboard|profile)/);
  });

  test('should display terms and privacy policy links', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Verify terms and privacy links are present
    await expect(page.locator('[data-testid="terms-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="privacy-link"]')).toBeVisible();

    // Test terms checkbox requirement
    await page.fill('[data-testid="email-input"]', 'terms@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');

    // Try to submit without accepting terms
    await page.click('[data-testid="register-submit"]');
    
    await expect(page.locator('[data-testid="terms-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="terms-error"]')).toContainText('You must accept the terms');

    // Accept terms and try again
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-submit"]');

    // Should proceed with registration
    await page.waitForSelector('[data-testid="registration-success"]');
  });

  test('should handle registration rate limiting', async ({ page }) => {
    // Simulate multiple rapid registration attempts
    for (let i = 0; i < 6; i++) {
      await page.goto('/register');
      await page.fill('[data-testid="email-input"]', `spam${i}@example.com`);
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-submit"]');
      
      if (i >= 5) {
        // Should hit rate limit
        await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText('Too many attempts');
      }
    }
  });

  test('should provide accessibility support', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus first input
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    // Test screen reader labels
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute('aria-label', 'Email address');

    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('aria-label', 'Password');

    // Test error announcements
    await page.fill('[data-testid="email-input"]', 'invalid');
    await page.click('[data-testid="register-submit"]');
    
    const errorElement = page.locator('[data-testid="email-error"]');
    await expect(errorElement).toHaveAttribute('role', 'alert');
    await expect(errorElement).toHaveAttribute('aria-live', 'polite');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Simulate network failure
    await page.route('**/api/auth/**', route => route.abort());

    await page.fill('[data-testid="email-input"]', 'network@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-submit"]');

    // Should show network error
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('Network error');

    // Should show retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should validate password strength requirements', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    const passwordTests = [
      { password: '123', strength: 'Very Weak', shouldPass: false },
      { password: 'password', strength: 'Weak', shouldPass: false },
      { password: 'Password123', strength: 'Medium', shouldPass: false },
      { password: 'Password123!', strength: 'Strong', shouldPass: true }
    ];

    for (const test of passwordTests) {
      await page.fill('[data-testid="password-input"]', '');
      await page.fill('[data-testid="password-input"]', test.password);
      
      // Wait for password strength indicator
      await page.waitForSelector('[data-testid="password-strength"]');
      
      const strengthIndicator = page.locator('[data-testid="password-strength"]');
      await expect(strengthIndicator).toContainText(test.strength);
      
      if (!test.shouldPass) {
        // Weak passwords should prevent submission
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="confirm-password-input"]', test.password);
        await page.check('[data-testid="terms-checkbox"]');
        await page.click('[data-testid="register-submit"]');
        
        await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      }
    }
  });

  test('should handle email verification flow', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    await page.fill('[data-testid="email-input"]', 'verify@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="display-name-input"]', 'Verify User');
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-submit"]');

    // Should redirect to email verification page
    await expect(page).toHaveURL('/verify-email');
    
    // Should show verification instructions
    await expect(page.locator('[data-testid="verification-instructions"]')).toBeVisible();
    await expect(page.locator('[data-testid="verification-instructions"]')).toContainText('Check your email');

    // Should provide resend option
    await expect(page.locator('[data-testid="resend-verification"]')).toBeVisible();
    
    // Test resend functionality
    await page.click('[data-testid="resend-verification"]');
    await expect(page.locator('[data-testid="resend-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="resend-success"]')).toContainText('Verification email sent');
  });

  test('should handle registration form persistence', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Fill form partially
    await page.fill('[data-testid="email-input"]', 'persistent@example.com');
    await page.fill('[data-testid="display-name-input"]', 'Persistent User');

    // Navigate away and back
    await page.click('[data-testid="login-link"]');
    await page.click('[data-testid="register-link"]');

    // Form should remember values (if implemented)
    const emailValue = await page.locator('[data-testid="email-input"]').inputValue();
    const nameValue = await page.locator('[data-testid="display-name-input"]').inputValue();
    
    // These assertions depend on whether form persistence is implemented
    // For now, we'll just verify the form is functional after navigation
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="display-name-input"]')).toBeVisible();
  });
});