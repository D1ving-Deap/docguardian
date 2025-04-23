
/**
 * Utility functions for handling paths and URLs
 */

/**
 * Ensures a path is a string, taking the first element if it's an array
 */
export function normalizePath(path: string | string[]): string {
  return Array.isArray(path) ? path[0] : path;
}

/**
 * Normalizes all paths in a fallback path configuration
 */
export function normalizeFallbackPaths(paths: {
  workerPath?: string | string[];
  corePath?: string | string[];
  trainingDataPath?: string | string[];
}): {
  workerPath?: string;
  corePath?: string;
  trainingDataPath?: string;
} {
  return {
    workerPath: paths.workerPath ? normalizePath(paths.workerPath) : undefined,
    corePath: paths.corePath ? normalizePath(paths.corePath) : undefined,
    trainingDataPath: paths.trainingDataPath ? normalizePath(paths.trainingDataPath) : undefined
  };
}
