/**
 * Admin Configuration Constants
 *
 * Centralized admin email configuration to ensure consistency
 * across authentication, registration, and OAuth flows.
 */

export const ADMIN_EMAIL = 'teleportdoor@gmail.com';

/**
 * Check if an email should have admin privileges
 * @param email - The email address to check
 * @returns true if the email should have admin privileges
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
