import { HandParser } from './hand-parser';
import { ParseResult } from '@/types/poker';

/**
 * Extension of HandParser to support parsing multiple hands from a single text input
 * This module provides the ability to split a complete hand history file into individual hands
 * and parse each one separately, maintaining order and handling errors gracefully.
 */
export class MultiHandParser {
  /**
   * Parse multiple hands from a single text input
   * Splits the text by hand headers and parses each individually
   *
   * @param fullHandHistoryText - Complete raw hand history text (potentially hundreds of hands)
   * @param siteFormatHint - Optional site format hint for optimization
   * @returns Array of ParseResult objects in original order (includes both successes and failures)
   */
  static parseMultipleHands(
    fullHandHistoryText: string,
    siteFormatHint?: string
  ): ParseResult[] {
    try {
      // Step 1: Split text into individual hands using regex boundary detection
      const handTexts = this.splitIntoHands(fullHandHistoryText);

      if (handTexts.length === 0) {
        return [
          {
            success: false,
            error: 'No valid hands found in the provided text. Please ensure the text contains hand history data from PokerStars, GGPoker, or PartyPoker.',
          },
        ];
      }

      // Step 2: Parse each hand individually
      const parsedHands: ParseResult[] = [];
      const errors: string[] = [];

      for (let i = 0; i < handTexts.length; i++) {
        try {
          // Use the existing HandParser.parse() method for each hand
          let result = HandParser.parse(handTexts[i]);

          // Add original text to successful parses for storage/debugging
          if (result.success && result.data) {
            result = { ...result, data: { ...result.data, originalText: handTexts[i] } };
          }

          parsedHands.push(result);

          // Track errors but continue parsing
          if (!result.success) {
            errors.push(`Hand ${i + 1}: ${result.error}`);
          }
        } catch (error) {
          // Log error but continue parsing other hands
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Hand ${i + 1}: ${errorMsg}`);
          parsedHands.push({
            success: false,
            error: `Failed to parse hand ${i + 1}: ${errorMsg}`,
          });
        }
      }

      // Log summary of errors (if any) for debugging
      if (errors.length > 0 && errors.length < handTexts.length) {
        console.warn(
          `Successfully parsed ${handTexts.length - errors.length}/${handTexts.length} hands. ${errors.length} hands had parsing errors.`
        );
      }

      // Return all results (including failures) for transparency
      // Frontend can decide how to handle partial failures
      return parsedHands;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return [
        {
          success: false,
          error: `Failed to process hand history: ${errorMsg}`,
        },
      ];
    }
  }

  /**
   * Split raw hand history text into individual hands
   * Uses regex patterns to detect hand boundaries for each supported site
   *
   * @param fullText - Complete raw hand history text
   * @returns Array of individual hand text strings in original order
   */
  private static splitIntoHands(fullText: string): string[] {
    const hands: string[] = [];

    // Regex patterns for hand headers (each site has different format)
    // These patterns identify the start of a new hand
    const patterns = [
      // PokerStars: "PokerStars Hand #123456:" or "PokerStars Game #123456:"
      /PokerStars (?:Hand|Game) #\d+/g,

      // GGPoker: "GGPoker Hand #HD123456:" or "Poker Hand #HD123456:"
      /(?:GGPoker Hand|Poker Hand) #[^\n]+/g,

      // PartyPoker: "PartyPoker Hand #123456:" or "***** Hand History for Game 123456"
      /(?:PartyPoker Hand #\d+|\*\*\*\*\* Hand History for Game \d+)/g,
    ];

    // Find all hand start positions across all patterns
    const handStarts: Array<{ index: number; match: string }> = [];

    for (const pattern of patterns) {
      let match;
      // Reset pattern for each search
      pattern.lastIndex = 0;

      while ((match = pattern.exec(fullText)) !== null) {
        handStarts.push({
          index: match.index,
          match: match[0],
        });
      }
    }

    // Sort by position to maintain original order
    handStarts.sort((a, b) => a.index - b.index);

    // Edge case: no hands found
    if (handStarts.length === 0) {
      return [];
    }

    // Extract hand texts by finding boundaries between headers
    for (let i = 0; i < handStarts.length; i++) {
      const start = handStarts[i].index;

      // End is either the start of next hand or end of file
      const end =
        i < handStarts.length - 1 ? handStarts[i + 1].index : fullText.length;

      const handText = fullText.substring(start, end).trim();

      // Sanity check for minimum hand length (filter out false positives)
      // A valid hand history should be at least 100 characters
      if (handText.length > 100) {
        hands.push(handText);
      }
    }

    return hands;
  }

  /**
   * Get statistics about a batch of parsed hands
   * Useful for reporting to users after upload
   *
   * @param results - Array of ParseResult objects
   * @returns Statistics object
   */
  static getParseStatistics(results: ParseResult[]): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const total = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      successful,
      failed,
      successRate,
    };
  }
}