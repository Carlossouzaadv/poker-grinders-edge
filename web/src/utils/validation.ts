import { HandHistory, Snapshot, Card, GameContext, Player, Action } from '@/types/poker';
import { AppError, ErrorCode, ErrorSeverity } from '@/types/errors';

/**
 * Runtime validation for HandHistory and Snapshot objects
 * Provides type-safe validation with detailed error reporting
 */
export class DataValidator {
  /**
   * Validate a complete HandHistory object
   * Returns array of errors found (empty if valid)
   */
  static validateHandHistory(handHistory: HandHistory): AppError[] {
    const errors: AppError[] = [];

    // 1. Validate required fields
    if (!handHistory.handId || handHistory.handId.trim() === '') {
      errors.push({
        code: ErrorCode.VALIDATION_MISSING_REQUIRED,
        message: 'HandHistory.handId is required',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (!handHistory.gameContext) {
      errors.push({
        code: ErrorCode.VALIDATION_MISSING_REQUIRED,
        message: 'HandHistory.gameContext is required',
        severity: ErrorSeverity.CRITICAL,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (!handHistory.players || handHistory.players.length === 0) {
      errors.push({
        code: ErrorCode.VALIDATION_MISSING_REQUIRED,
        message: 'HandHistory.players must have at least one player',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    // 2. Validate players
    if (handHistory.players) {
      const playerErrors = this.validatePlayers(handHistory.players, handHistory.gameContext);
      errors.push(...playerErrors);
    }

    // 3. Validate streets - now always defined
    if (!handHistory.preflop || !Array.isArray(handHistory.preflop)) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'HandHistory.preflop must be an array',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (!handHistory.flop || !Array.isArray(handHistory.flop.cards)) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'HandHistory.flop must be defined with cards array',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (!handHistory.turn || !Array.isArray(handHistory.turn.actions)) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'HandHistory.turn must be defined with actions array',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (!handHistory.river || !Array.isArray(handHistory.river.actions)) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'HandHistory.river must be defined with actions array',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    // 4. Validate card consistency
    const cardErrors = this.validateCardConsistency(handHistory);
    errors.push(...cardErrors);

    // 5. Validate GameContext consistency
    if (handHistory.gameContext) {
      const contextErrors = this.validateGameContext(handHistory.gameContext);
      errors.push(...contextErrors);
    }

    // 6. Validate monetary values are non-negative
    if (handHistory.smallBlind < 0) {
      errors.push({
        code: ErrorCode.MATH_NEGATIVE_VALUE,
        message: 'HandHistory.smallBlind cannot be negative',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (handHistory.bigBlind < 0) {
      errors.push({
        code: ErrorCode.MATH_NEGATIVE_VALUE,
        message: 'HandHistory.bigBlind cannot be negative',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    if (handHistory.totalPot < 0) {
      errors.push({
        code: ErrorCode.MATH_NEGATIVE_VALUE,
        message: 'HandHistory.totalPot cannot be negative',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateHandHistory'
      });
    }

    return errors;
  }

  /**
   * Validate GameContext for consistency
   */
  private static validateGameContext(context: GameContext): AppError[] {
    const errors: AppError[] = [];

    // Tournament games should have chips, cash games should have dollars
    if (context.isTournament && context.currencyUnit !== 'chips') {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Tournament games must use chips as currency unit',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateGameContext',
        details: { gameContext: context }
      });
    }

    if (!context.isTournament && context.currencyUnit !== 'dollars') {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Cash games must use dollars as currency unit',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateGameContext',
        details: { gameContext: context }
      });
    }

    // Tournament games should NOT need conversion (already in chips)
    if (context.isTournament && context.conversionNeeded) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Tournament games should not require conversion (already in chips)',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateGameContext',
        details: { gameContext: context }
      });
    }

    // Cash games SHOULD need conversion (dollars to cents)
    if (!context.isTournament && !context.conversionNeeded) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Cash games should require conversion (dollars to cents)',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateGameContext',
        details: { gameContext: context }
      });
    }

    return errors;
  }

  /**
   * Validate players array
   */
  private static validatePlayers(players: readonly Player[], context?: GameContext): AppError[] {
    const errors: AppError[] = [];

    // Check for at least one hero
    const heroes = players.filter(p => p.isHero);
    if (heroes.length === 0) {
      errors.push({
        code: ErrorCode.VALIDATION_MISSING_REQUIRED,
        message: 'At least one player must be marked as hero',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validatePlayers'
      });
    }

    if (heroes.length > 1) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Only one player can be marked as hero',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validatePlayers',
        details: { heroCount: heroes.length }
      });
    }

    // Validate each player
    players.forEach((player, index) => {
      if (!player.name || player.name.trim() === '') {
        errors.push({
          code: ErrorCode.VALIDATION_MISSING_REQUIRED,
          message: `Player at index ${index} has no name`,
          severity: ErrorSeverity.ERROR,
          isRecoverable: false,
          timestamp: new Date(),
          context: 'DataValidator.validatePlayers'
        });
      }

      if (player.stack < 0) {
        errors.push({
          code: ErrorCode.MATH_NEGATIVE_VALUE,
          message: `Player ${player.name} has negative stack: ${player.stack}`,
          severity: ErrorSeverity.ERROR,
          isRecoverable: false,
          timestamp: new Date(),
          context: 'DataValidator.validatePlayers'
        });
      }

      // Validate cards if present
      if (player.cards) {
        if (player.cards.length !== 2 && player.cards.length !== 0) {
          errors.push({
            code: ErrorCode.PARSE_INVALID_CARD,
            message: `Player ${player.name} has invalid card count: ${player.cards.length} (should be 0 or 2)`,
            severity: ErrorSeverity.ERROR,
            isRecoverable: false,
            timestamp: new Date(),
            context: 'DataValidator.validatePlayers'
          });
        }

        // Validate each card
        player.cards.forEach(card => {
          const cardErrors = this.validateCard(card, `Player ${player.name}`);
          errors.push(...cardErrors);
        });
      }
    });

    return errors;
  }

  /**
   * Validate a single card
   */
  private static validateCard(card: Card, context: string): AppError[] {
    const errors: AppError[] = [];
    const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits = ['h', 'd', 'c', 's'];

    if (!validRanks.includes(card.rank)) {
      errors.push({
        code: ErrorCode.PARSE_INVALID_CARD,
        message: `Invalid card rank: ${card.rank} in ${context}`,
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateCard'
      });
    }

    if (!validSuits.includes(card.suit)) {
      errors.push({
        code: ErrorCode.PARSE_INVALID_CARD,
        message: `Invalid card suit: ${card.suit} in ${context}`,
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateCard'
      });
    }

    return errors;
  }

  /**
   * Validate card consistency across streets
   */
  private static validateCardConsistency(handHistory: HandHistory): AppError[] {
    const errors: AppError[] = [];

    // Flop should have 0 or 3 cards
    if (handHistory.flop.cards.length !== 0 && handHistory.flop.cards.length !== 3) {
      errors.push({
        code: ErrorCode.PARSE_INVALID_CARD,
        message: `Flop should have 0 or 3 cards, found ${handHistory.flop.cards.length}`,
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateCardConsistency'
      });
    }

    // Turn should have null or a valid card
    if (handHistory.turn.card !== null) {
      const cardErrors = this.validateCard(handHistory.turn.card, 'Turn');
      errors.push(...cardErrors);
    }

    // River should have null or a valid card
    if (handHistory.river.card !== null) {
      const cardErrors = this.validateCard(handHistory.river.card, 'River');
      errors.push(...cardErrors);
    }

    // If there's a turn, there must be a flop
    if (handHistory.turn.card !== null && handHistory.flop.cards.length === 0) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Cannot have turn card without flop cards',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateCardConsistency'
      });
    }

    // If there's a river, there must be a turn and flop
    if (handHistory.river.card !== null && (handHistory.turn.card === null || handHistory.flop.cards.length === 0)) {
      errors.push({
        code: ErrorCode.VALIDATION_INVALID_FORMAT,
        message: 'Cannot have river card without turn and flop cards',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateCardConsistency'
      });
    }

    return errors;
  }

  /**
   * Validate a complete Snapshot object
   * Returns array of errors found (empty if valid)
   */
  static validateSnapshot(snapshot: Snapshot): AppError[] {
    const errors: AppError[] = [];

    // 1. Validate required fields
    if (snapshot.id < 0) {
      errors.push({
        code: ErrorCode.SNAPSHOT_INVALID_ACTION,
        message: `Snapshot.id cannot be negative: ${snapshot.id}`,
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateSnapshot'
      });
    }

    if (!snapshot.description || snapshot.description.trim() === '') {
      errors.push({
        code: ErrorCode.VALIDATION_MISSING_REQUIRED,
        message: 'Snapshot.description is required',
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateSnapshot'
      });
    }

    // 2. Validate pots
    if (!snapshot.pots || snapshot.pots.length === 0) {
      errors.push({
        code: ErrorCode.SNAPSHOT_INVALID_POT,
        message: 'Snapshot must have at least one pot',
        severity: ErrorSeverity.ERROR,
        isRecoverable: false,
        timestamp: new Date(),
        context: 'DataValidator.validateSnapshot'
      });
    } else {
      snapshot.pots.forEach((pot, index) => {
        if (pot.value < 0) {
          errors.push({
            code: ErrorCode.MATH_NEGATIVE_VALUE,
            message: `Pot ${index} has negative value: ${pot.value}`,
            severity: ErrorSeverity.ERROR,
            isRecoverable: false,
            timestamp: new Date(),
            context: 'DataValidator.validateSnapshot'
          });
        }

        if (!pot.eligiblePlayers || pot.eligiblePlayers.length === 0) {
          errors.push({
            code: ErrorCode.SNAPSHOT_INVALID_POT,
            message: `Pot ${index} has no eligible players`,
            severity: ErrorSeverity.ERROR,
            isRecoverable: false,
            timestamp: new Date(),
            context: 'DataValidator.validateSnapshot'
          });
        }
      });
    }

    // 3. Validate player stacks are non-negative
    if (snapshot.playerStacks) {
      Object.entries(snapshot.playerStacks).forEach(([player, stack]) => {
        if (stack < 0) {
          errors.push({
            code: ErrorCode.SNAPSHOT_NEGATIVE_STACK,
            message: `Player ${player} has negative stack: ${stack}`,
            severity: ErrorSeverity.CRITICAL,
            isRecoverable: false,
            timestamp: new Date(),
            context: 'DataValidator.validateSnapshot'
          });
        }
      });
    }

    // 4. Validate totalDisplayedPot matches sum of pots and pending contribs
    const sumPots = snapshot.pots.reduce((sum, pot) => sum + pot.value, 0);
    const sumPending = Object.values(snapshot.pendingContribs || {}).reduce((sum, val) => sum + val, 0);
    const expectedTotal = sumPots + sumPending;

    if (Math.abs(snapshot.totalDisplayedPot - expectedTotal) > 1) { // Allow 1 cent rounding
      errors.push({
        code: ErrorCode.SNAPSHOT_POT_MISMATCH,
        message: `Total displayed pot (${snapshot.totalDisplayedPot}) doesn't match sum of pots (${sumPots}) + pending (${sumPending})`,
        severity: ErrorSeverity.WARNING,
        isRecoverable: true,
        timestamp: new Date(),
        context: 'DataValidator.validateSnapshot',
        details: { totalDisplayedPot: snapshot.totalDisplayedPot, sumPots, sumPending }
      });
    }

    // 5. Validate community cards
    if (snapshot.communityCards) {
      snapshot.communityCards.forEach(card => {
        const cardErrors = this.validateCard(card, `Snapshot ${snapshot.id} community cards`);
        errors.push(...cardErrors);
      });
    }

    // 6. Validate revealed hands
    if (snapshot.revealedHands) {
      Object.entries(snapshot.revealedHands).forEach(([player, cards]) => {
        if (cards && cards.length !== 2) {
          errors.push({
            code: ErrorCode.PARSE_INVALID_CARD,
            message: `Player ${player} revealed hand has ${cards.length} cards (should be 2)`,
            severity: ErrorSeverity.ERROR,
            isRecoverable: false,
            timestamp: new Date(),
            context: 'DataValidator.validateSnapshot'
          });
        }

        if (cards) {
          cards.forEach(card => {
            const cardErrors = this.validateCard(card, `Snapshot ${snapshot.id} revealed hand for ${player}`);
            errors.push(...cardErrors);
          });
        }
      });
    }

    return errors;
  }
}
