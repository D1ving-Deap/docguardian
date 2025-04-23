
/**
 * Utility functions for path handling and normalization
 */

/**
 * Normalizes a path that could be either a string or string array to a single string path
 */
export const normalizePath = (path: string | string[]): string => {
  if (Array.isArray(path)) {
    return path[0] || ''; // Return first element or empty string
  }
  return path;
};

/**
 * Creates an absolute URL for an asset path
 */
export const createAbsoluteUrl = (path: string): string => {
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  const baseOrigin = window.location.origin;
  return path.startsWith('/') 
    ? `${baseOrigin}${path}` 
    : `${baseOrigin}/${path}`;
};

/**
 * Determines if a URL is external (not on the same origin)
 */
export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
};
