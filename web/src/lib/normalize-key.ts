/**
 * PRODUCTION-GRADE Key Normalization System
 *
 * Ensures 100% consistency for player name lookups across the entire poker system.
 * Critical for Map/Record/Set operations where player names are keys.
 *
 * NORMALIZATION RULES (applied in order):
 * 1. Trim leading/trailing whitespace
 * 2. Convert to lowercase
 * 3. Decompose Unicode characters (NFD form)
 * 4. Remove diacritics/accents (e.g., "José" → "jose")
 * 5. Remove special characters (keep only a-z, 0-9, space)
 * 6. Consolidate multiple spaces into single space
 * 7. Final trim
 *
 * EXAMPLES:
 * - "José María" → "jose maria"
 * - "John   Doe" → "john doe"
 * - "Player_123!" → "player123"
 * - "  Hero  " → "hero"
 * - "CashUrChecks" → "cashurchecks"
 *
 * @param name - Player name to normalize (can be undefined/null)
 * @returns Normalized key (empty string if input is invalid)
 */
export function normalizeKey(name: string | undefined | null): string {
  // GUARD: Handle undefined/null/empty inputs
  if (!name) return '';
  if (typeof name !== 'string') return '';

  return name
    .trim()
    .toLowerCase()
    .normalize('NFD') // Decompose Unicode characters (e.g., "é" → "e" + combining accent)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters (keep letters, numbers, spaces)
    .replace(/\s+/g, ' ') // Consolidate multiple spaces
    .trim(); // Final trim
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

/**
 * Validates if a player name is valid (non-empty after normalization)
 *
 * @param name - Player name to validate
 * @returns true if name is valid, false otherwise
 *
 * @example
 * isValidPlayerName("José") // true
 * isValidPlayerName("   ") // false
 * isValidPlayerName("") // false
 * isValidPlayerName(undefined) // false
 */
export function isValidPlayerName(name: string | undefined | null): boolean {
  return normalizeKey(name).length > 0;
}

/**
 * Checks if a Set or Map contains a normalized key
 *
 * @param setOrMap - Set or Map to check
 * @param key - Key to look for (will be normalized)
 * @returns true if normalized key exists, false otherwise
 *
 * @example
 * const folded = new Set(['hero', 'villain1']);
 * hasNormalized(folded, 'HERO') // true
 * hasNormalized(folded, 'José María') // false (if not in set)
 */
export function hasNormalized(setOrMap: Set<string> | Record<string, any>, key: string): boolean {
  const normalizedKey = normalizeKey(key);

  if (setOrMap instanceof Set) {
    return setOrMap.has(normalizedKey);
  } else {
    return normalizedKey in setOrMap;
  }
}

/**
 * Deletes a key from a map using normalized key
 *
 * @param map - Map to delete from
 * @param key - Key to delete (will be normalized)
 * @returns true if key was deleted, false if it didn't exist
 */
export function deleteNormalized<T>(map: Record<string, T>, key: string): boolean {
  const normalizedKey = normalizeKey(key);
  if (normalizedKey in map) {
    delete map[normalizedKey];
    return true;
  }
  return false;
}

/**
 * Gets all normalized keys from a map
 *
 * @param map - Map to get keys from
 * @returns Array of normalized keys
 */
export function getNormalizedKeys<T>(map: Record<string, T>): string[] {
  return Object.keys(map).map(normalizeKey);
}

/**
 * Batch normalize multiple player names
 *
 * @param names - Array of player names
 * @returns Array of normalized keys (preserves order)
 */
export function normalizeKeys(names: string[]): string[] {
  return names.map(normalizeKey);
}

/**
 * Creates a Set with normalized player names
 *
 * @param names - Array of player names
 * @returns Set with normalized keys
 */
export function createNormalizedSet(names: string[]): Set<string> {
  return new Set(names.map(normalizeKey));
}