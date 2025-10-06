/**
 * Hand Notes Storage
 * Persists hand notes and tags to localStorage
 */

import { HandNotes } from '@/types/notes';

const STORAGE_KEY_PREFIX = 'poker_notes_';

export class HandNotesStorage {
  /**
   * Save notes for a hand
   */
  static save(notes: HandNotes): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${notes.handId}`;
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save hand notes:', error);
    }
  }

  /**
   * Load notes for a hand
   */
  static load(handId: string): HandNotes | null {
    try {
      const key = `${STORAGE_KEY_PREFIX}${handId}`;
      const data = localStorage.getItem(key);

      if (!data) return null;

      const notes: HandNotes = JSON.parse(data);

      // Convert date strings back to Date objects
      notes.createdAt = new Date(notes.createdAt);
      notes.updatedAt = new Date(notes.updatedAt);

      return notes;
    } catch (error) {
      console.error('Failed to load hand notes:', error);
      return null;
    }
  }

  /**
   * Delete notes for a hand
   */
  static delete(handId: string): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${handId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to delete hand notes:', error);
    }
  }

  /**
   * Get all saved hand IDs
   */
  static getAllHandIds(): string[] {
    try {
      const handIds: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          const handId = key.substring(STORAGE_KEY_PREFIX.length);
          handIds.push(handId);
        }
      }

      return handIds;
    } catch (error) {
      console.error('Failed to get all hand IDs:', error);
      return [];
    }
  }

  /**
   * Create a new HandNotes object
   */
  static create(handId: string, notes: string = '', tags: string[] = []): HandNotes {
    return {
      id: `${handId}_${Date.now()}`,
      handId,
      notes,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Update existing notes
   */
  static update(existingNotes: HandNotes, newNotes: string, newTags: string[]): HandNotes {
    return {
      ...existingNotes,
      notes: newNotes,
      tags: newTags,
      updatedAt: new Date()
    };
  }
}
