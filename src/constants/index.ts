// Storage keys
export const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  THEME_MODE: 'theme_mode',
  USER_SESSION: 'user_session',
} as const;

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Pagination
export const ITEMS_PER_PAGE = 20;

// Role hierarchy
export const ROLE_HIERARCHY: Record<string, number> = {
  staff: 1,
  admin: 2,
  super_admin: 3,
};

