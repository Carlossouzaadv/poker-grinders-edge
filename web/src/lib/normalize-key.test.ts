/**
 * Comprehensive tests for key normalization system
 *
 * Tests 100% coverage of edge cases for production-grade player name normalization
 */

import {
  normalizeKey,
  isValidPlayerName,
  hasNormalized,
  getNormalized,
  setNormalized,
  incrementNormalized,
  deleteNormalized,
  getNormalizedKeys,
  normalizeKeys,
  createNormalizedSet,
  normalizeMap
} from './normalize-key';

describe('normalizeKey', () => {

  describe('Basic Normalization', () => {

    it('should convert to lowercase', () => {
      expect(normalizeKey('HERO')).toBe('hero');
      expect(normalizeKey('Hero')).toBe('hero');
      expect(normalizeKey('hErO')).toBe('hero');
    });

    it('should trim whitespace', () => {
      expect(normalizeKey('  hero  ')).toBe('hero');
      expect(normalizeKey('\thero\t')).toBe('hero');
      expect(normalizeKey('\nhero\n')).toBe('hero');
    });

    it('should consolidate multiple spaces', () => {
      expect(normalizeKey('John   Doe')).toBe('john doe');
      expect(normalizeKey('Player    123')).toBe('player 123');
      expect(normalizeKey('A  B  C')).toBe('a b c');
    });

  });

  describe('Unicode and Diacritics', () => {

    it('should remove accents from Latin characters', () => {
      expect(normalizeKey('José')).toBe('jose');
      expect(normalizeKey('María')).toBe('maria');
      expect(normalizeKey('François')).toBe('francois');
      expect(normalizeKey('Müller')).toBe('muller');
    });

    it('should handle combined names with accents', () => {
      expect(normalizeKey('José María')).toBe('jose maria');
      expect(normalizeKey('François Müller')).toBe('francois muller');
    });

    it('should handle various diacritical marks', () => {
      expect(normalizeKey('café')).toBe('cafe');
      expect(normalizeKey('naïve')).toBe('naive');
      expect(normalizeKey('Zürich')).toBe('zurich');
      expect(normalizeKey('São Paulo')).toBe('sao paulo');
    });

  });

  describe('Special Characters', () => {

    it('should remove underscores', () => {
      expect(normalizeKey('Player_123')).toBe('player123');
      expect(normalizeKey('Cash_Ur_Checks')).toBe('cashurchecks');
    });

    it('should remove hyphens and dashes', () => {
      expect(normalizeKey('Player-123')).toBe('player123');
      expect(normalizeKey('John-Doe')).toBe('johndoe');
      expect(normalizeKey('High—Stakes')).toBe('highstakes');
    });

    it('should remove punctuation', () => {
      expect(normalizeKey('Player123!')).toBe('player123');
      expect(normalizeKey('Hero?')).toBe('hero');
      expect(normalizeKey('Cash.Money')).toBe('cashmoney');
      expect(normalizeKey('Player(1)')).toBe('player1');
    });

    it('should remove symbols', () => {
      expect(normalizeKey('$Player$')).toBe('player');
      expect(normalizeKey('@Hero@')).toBe('hero');
      expect(normalizeKey('Player#123')).toBe('player123');
      expect(normalizeKey('Cash&Money')).toBe('cashmoney');
    });

  });

  describe('Edge Cases', () => {

    it('should handle empty string', () => {
      expect(normalizeKey('')).toBe('');
      expect(normalizeKey('   ')).toBe('');
      expect(normalizeKey('\t\n')).toBe('');
    });

    it('should handle undefined', () => {
      expect(normalizeKey(undefined)).toBe('');
    });

    it('should handle null', () => {
      expect(normalizeKey(null)).toBe('');
    });

    it('should handle non-string inputs gracefully', () => {
      expect(normalizeKey(123 as any)).toBe('');
      expect(normalizeKey({} as any)).toBe('');
      expect(normalizeKey([] as any)).toBe('');
    });

    it('should handle numeric strings', () => {
      expect(normalizeKey('123')).toBe('123');
      expect(normalizeKey('Player 123')).toBe('player 123');
    });

    it('should handle single characters', () => {
      expect(normalizeKey('A')).toBe('a');
      expect(normalizeKey('1')).toBe('1');
      expect(normalizeKey(' ')).toBe('');
    });

    it('should handle control characters', () => {
      expect(normalizeKey('Hero\u0000')).toBe('hero');
      expect(normalizeKey('\u0001Player\u0002')).toBe('player');
    });

  });

  describe('Real-world Poker Player Names', () => {

    it('should normalize PokerStars-style names', () => {
      expect(normalizeKey('CashUrChecks')).toBe('cashurchecks');
      expect(normalizeKey('PokerPro_88')).toBe('pokerpro88');
      expect(normalizeKey('xXx_Shark_xXx')).toBe('xxxsharkxxx');
    });

    it('should normalize GGPoker-style names', () => {
      expect(normalizeKey('Player123456')).toBe('player123456');
      expect(normalizeKey('Hero999')).toBe('hero999');
    });

    it('should normalize names with spaces', () => {
      expect(normalizeKey('John Doe')).toBe('john doe');
      expect(normalizeKey('Super Star')).toBe('super star');
    });

  });

  describe('Normalization Consistency', () => {

    it('should produce same output for equivalent inputs', () => {
      const inputs = ['HERO', 'Hero', 'hero', '  hero  ', 'hero\n'];
      const normalized = inputs.map(normalizeKey);
      const expected = 'hero';

      normalized.forEach(result => {
        expect(result).toBe(expected);
      });
    });

    it('should be idempotent (normalizing twice gives same result)', () => {
      const inputs = ['José María', 'Player_123!', 'John   Doe'];

      inputs.forEach(input => {
        const once = normalizeKey(input);
        const twice = normalizeKey(once);
        expect(once).toBe(twice);
      });
    });

  });

});

describe('isValidPlayerName', () => {

  it('should return true for valid names', () => {
    expect(isValidPlayerName('Hero')).toBe(true);
    expect(isValidPlayerName('José')).toBe(true);
    expect(isValidPlayerName('Player 123')).toBe(true);
    expect(isValidPlayerName('123')).toBe(true);
  });

  it('should return false for invalid names', () => {
    expect(isValidPlayerName('')).toBe(false);
    expect(isValidPlayerName('   ')).toBe(false);
    expect(isValidPlayerName('\t\n')).toBe(false);
    expect(isValidPlayerName(undefined)).toBe(false);
    expect(isValidPlayerName(null)).toBe(false);
  });

  it('should return false for special-char-only names', () => {
    expect(isValidPlayerName('!!!')).toBe(false);
    expect(isValidPlayerName('___')).toBe(false);
    expect(isValidPlayerName('...')).toBe(false);
  });

});

describe('Map Utilities', () => {

  describe('getNormalized', () => {

    it('should get value with normalized key', () => {
      const map = { hero: 100, villain: 200 };

      expect(getNormalized(map, 'HERO')).toBe(100);
      expect(getNormalized(map, 'Hero')).toBe(100);
      expect(getNormalized(map, '  hero  ')).toBe(100);
    });

    it('should return undefined for missing keys', () => {
      const map = { hero: 100 };

      expect(getNormalized(map, 'villain')).toBeUndefined();
      expect(getNormalized(map, 'VILLAIN')).toBeUndefined();
    });

    it('should handle keys with accents', () => {
      const map = { jose: 100 }; // Already normalized

      expect(getNormalized(map, 'José')).toBe(100);
      expect(getNormalized(map, 'JOSÉ')).toBe(100);
    });

  });

  describe('setNormalized', () => {

    it('should set value with normalized key', () => {
      const map: Record<string, number> = {};

      setNormalized(map, 'HERO', 100);
      expect(map['hero']).toBe(100);

      setNormalized(map, '  Hero  ', 200);
      expect(map['hero']).toBe(200); // Overwrite
    });

    it('should handle keys with special characters', () => {
      const map: Record<string, number> = {};

      setNormalized(map, 'Player_123!', 100);
      expect(map['player123']).toBe(100);
    });

  });

  describe('incrementNormalized', () => {

    it('should increment existing value', () => {
      const map = { hero: 100 };

      incrementNormalized(map, 'HERO', 50);
      expect(map['hero']).toBe(150);
    });

    it('should initialize to amount if key does not exist', () => {
      const map: Record<string, number> = {};

      incrementNormalized(map, 'villain', 100);
      expect(map['villain']).toBe(100);
    });

    it('should handle multiple increments', () => {
      const map: Record<string, number> = {};

      incrementNormalized(map, 'Player', 10);
      incrementNormalized(map, 'PLAYER', 20);
      incrementNormalized(map, 'player', 30);

      expect(map['player']).toBe(60); // All increments to same key
    });

  });

  describe('deleteNormalized', () => {

    it('should delete existing key', () => {
      const map = { hero: 100, villain: 200 };

      const deleted = deleteNormalized(map, 'HERO');
      expect(deleted).toBe(true);
      expect(map['hero']).toBeUndefined();
      expect(map['villain']).toBe(200); // Other keys unaffected
    });

    it('should return false for non-existent key', () => {
      const map = { hero: 100 };

      const deleted = deleteNormalized(map, 'villain');
      expect(deleted).toBe(false);
    });

  });

  describe('normalizeMap', () => {

    it('should normalize all keys in map', () => {
      const map = {
        'HERO': 100,
        'Villain_1': 200,
        'José María': 300
      };

      const normalized = normalizeMap(map);

      expect(normalized['hero']).toBe(100);
      expect(normalized['villain1']).toBe(200);
      expect(normalized['jose maria']).toBe(300);
    });

    it('should preserve values', () => {
      const map = { 'Player 1': { stack: 1000, position: 'BTN' } };
      const normalized = normalizeMap(map);

      expect(normalized['player 1']).toEqual({ stack: 1000, position: 'BTN' });
    });

  });

});

describe('Set Utilities', () => {

  describe('hasNormalized', () => {

    it('should check Set with normalized key', () => {
      const set = new Set(['hero', 'villain']);

      expect(hasNormalized(set, 'HERO')).toBe(true);
      expect(hasNormalized(set, 'Hero')).toBe(true);
      expect(hasNormalized(set, 'villain')).toBe(true);
      expect(hasNormalized(set, 'player')).toBe(false);
    });

    it('should check Map with normalized key', () => {
      const map = { hero: 100, villain: 200 };

      expect(hasNormalized(map, 'HERO')).toBe(true);
      expect(hasNormalized(map, 'Hero')).toBe(true);
      expect(hasNormalized(map, 'villain')).toBe(true);
      expect(hasNormalized(map, 'player')).toBe(false);
    });

  });

  describe('createNormalizedSet', () => {

    it('should create set with normalized keys', () => {
      const names = ['HERO', 'Villain_1', 'José María'];
      const set = createNormalizedSet(names);

      expect(set.has('hero')).toBe(true);
      expect(set.has('villain1')).toBe(true);
      expect(set.has('jose maria')).toBe(true);
      expect(set.size).toBe(3);
    });

    it('should remove duplicates after normalization', () => {
      const names = ['HERO', 'Hero', 'hero', '  hero  '];
      const set = createNormalizedSet(names);

      expect(set.size).toBe(1);
      expect(set.has('hero')).toBe(true);
    });

  });

});

describe('Array Utilities', () => {

  describe('normalizeKeys', () => {

    it('should normalize array of keys', () => {
      const keys = ['HERO', 'Villain_1', 'José María'];
      const normalized = normalizeKeys(keys);

      expect(normalized).toEqual(['hero', 'villain1', 'jose maria']);
    });

    it('should preserve order', () => {
      const keys = ['C', 'B', 'A'];
      const normalized = normalizeKeys(keys);

      expect(normalized).toEqual(['c', 'b', 'a']);
    });

  });

  describe('getNormalizedKeys', () => {

    it('should get normalized keys from map', () => {
      const map = { 'HERO': 100, 'Villain_1': 200 };
      const keys = getNormalizedKeys(map);

      expect(keys).toContain('hero');
      expect(keys).toContain('villain1');
      expect(keys).toHaveLength(2);
    });

  });

});

describe('Integration Tests', () => {

  it('should handle complete poker scenario', () => {
    // Simulate a poker hand with various player name formats
    const contributions: Record<string, number> = {};
    const folded = new Set<string>();

    // Players join with different name formats
    setNormalized(contributions, 'HERO', 100);
    setNormalized(contributions, 'Villain_1', 200);
    setNormalized(contributions, 'José María', 150);
    setNormalized(contributions, 'Player  123', 50);

    // Player folds
    folded.add(normalizeKey('Player  123'));

    // Increment contributions
    incrementNormalized(contributions, 'hero', 50); // Should add to HERO
    incrementNormalized(contributions, 'villain_1', 100); // Should add to Villain_1

    // Verify
    expect(getNormalized(contributions, 'Hero')).toBe(150); // 100 + 50
    expect(getNormalized(contributions, 'VILLAIN_1')).toBe(300); // 200 + 100
    expect(getNormalized(contributions, 'josé maría')).toBe(150);

    expect(hasNormalized(folded, 'PLAYER 123')).toBe(true);
    expect(hasNormalized(folded, 'player 123')).toBe(true); // With space
  });

  it('should maintain consistency across all operations', () => {
    // Test 1: Underscores and hyphens removed → no space
    const playerName1 = 'José_María-123!';
    const normalized1 = normalizeKey(playerName1);
    expect(normalized1).toBe('josemaria123'); // _ and - removed, no space between

    // Test 2: Natural spaces preserved
    const playerName2 = 'José María 123';
    const normalized2 = normalizeKey(playerName2);
    expect(normalized2).toBe('jose maria 123'); // Natural space preserved

    // All these should refer to the same player (with natural space)
    const variations = [
      'JOSÉ MARÍA 123',
      'jose maria 123',
      '  josé  maría  123  '
    ];

    variations.forEach(variation => {
      expect(normalizeKey(variation)).toBe(normalized2);
    });
  });

});
