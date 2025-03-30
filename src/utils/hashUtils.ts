
/**
 * Generates a consistent numeric hash from a string
 * @param str String to hash (like an email)
 * @returns A positive numeric hash value
 */
export const generateNumericHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
