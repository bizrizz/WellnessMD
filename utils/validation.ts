/**
 * Shared input validation for the app.
 * Returns { valid: true } or { valid: false, error: string }.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_HHMM_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export function validateEmail(email: string): { valid: true } | { valid: false; error: string } {
  const trimmed = email.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Please enter a valid email address' };
  if (trimmed.length > 254) return { valid: false, error: 'Email is too long' };
  return { valid: true };
}

export function validatePassword(
  password: string,
  options?: { forSignUp?: boolean }
): { valid: true } | { valid: false; error: string } {
  if (password.length === 0) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  if (options?.forSignUp && password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  return { valid: true };
}

export function validateName(name: string): { valid: true } | { valid: false; error: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Name is required' };
  if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (trimmed.length > 100) return { valid: false, error: 'Name must be 100 characters or less' };
  return { valid: true };
}

export function validatePostTitle(title: string): { valid: true } | { valid: false; error: string } {
  const trimmed = title.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Title is required' };
  if (trimmed.length > 200) return { valid: false, error: 'Title must be 200 characters or less' };
  return { valid: true };
}

const POST_CONTENT_MAX = 2000;
export function validatePostContent(content: string): { valid: true } | { valid: false; error: string } {
  const trimmed = content.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Please write something' };
  if (trimmed.length > POST_CONTENT_MAX) {
    return { valid: false, error: `Content must be ${POST_CONTENT_MAX} characters or less` };
  }
  return { valid: true };
}

const COMMENT_MAX = 1000;
export function validateComment(content: string): { valid: true } | { valid: false; error: string } {
  const trimmed = content.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Comment cannot be empty' };
  if (trimmed.length > COMMENT_MAX) {
    return { valid: false, error: `Comment must be ${COMMENT_MAX} characters or less` };
  }
  return { valid: true };
}

export function validateTimeHHMM(value: string): { valid: true } | { valid: false; error: string } {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Time is required' };
  if (!TIME_HHMM_REGEX.test(trimmed)) {
    return { valid: false, error: 'Use 24-hour format (e.g. 22:00 or 09:30)' };
  }
  return { valid: true };
}
