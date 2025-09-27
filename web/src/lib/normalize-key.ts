/**
 * Utility for normalizing player names/keys for consistent map access
 * Handles variations in player names (case, whitespace, special chars)
 */

/**
 * Normalizes a player name/key for consistent map access
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes invisible/control characters
 * - Normalizes Unicode characters
 */
export function normalizeKey(name: string | undefined): string {
  if (!name) return '';

  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD') // Normalize Unicode
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Creates a normalized map from an existing map
 */
export function normalizeMap<T>(map: Record<string, T>): Record<string, T> {
  const normalized: Record<string, T> = {};
  for (const [key, value] of Object.entries(map)) {
    normalized[normalizeKey(key)] = value;
  }
  return normalized;
}

/**
 * Gets a value from a map using normalized key
 */
export function getNormalized<T>(map: Record<string, T>, key: string): T | undefined {
  return map[normalizeKey(key)];
}

/**
 * Sets a value in a map using normalized key
 */
export function setNormalized<T>(map: Record<string, T>, key: string, value: T): void {
  map[normalizeKey(key)] = value;
}

/**
 * Increments a numeric value in a map using normalized key
 */
export function incrementNormalized(map: Record<string, number>, key: string, amount: number): void {
  const normalizedKey = normalizeKey(key);
  map[normalizedKey] = (map[normalizedKey] || 0) + amount;
}