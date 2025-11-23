
/**
 * Security Utility Service
 * Handles input sanitization, validation, and rate limiting.
 */

// Constants for security limits
export const MAX_CHARS = 400;
export const RATE_LIMIT_COOLDOWN_MS = 5000; // 5 seconds between requests

let lastRequestTime = 0;

/**
 * Sanitizes user input to prevent injection attacks and remove unwanted characters.
 * - Removes HTML tags
 * - Trims whitespace
 * - Removes non-printable characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  
  // 1. Basic HTML tag removal
  let clean = input.replace(/<[^>]*>?/gm, "");
  
  // 2. Remove control characters (except newlines)
  clean = clean.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");
  
  // 3. Trim
  return clean.trim();
};

/**
 * Validates the input length and content.
 */
export const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: "El texto no puede estar vacío." };
  }
  
  if (input.length > MAX_CHARS) {
    return { isValid: false, error: `El texto excede el límite de seguridad de ${MAX_CHARS} caracteres.` };
  }

  return { isValid: true };
};

/**
 * Checks if the user is making requests too quickly.
 */
export const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_COOLDOWN_MS) {
    return false;
  }
  lastRequestTime = now;
  return true;
};

/**
 * Mask API Key for display purposes (visual security).
 */
export const maskKey = (key: string | undefined): string => {
  if (!key) return "No Configurada";
  return key.substring(0, 4) + "••••••••••••••••" + key.substring(key.length - 4);
};
