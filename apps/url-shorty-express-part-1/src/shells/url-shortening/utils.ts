/**
 * Generates a random short ID for URL shortening
 * @param length - Length of the short ID to generate
 * @returns A random string of alphanumeric characters
 */
export function generateShortId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

