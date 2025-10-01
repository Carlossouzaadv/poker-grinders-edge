/**
 * Response DTO for Hand History Session
 * Contains session metadata and the first parsed hand for immediate display
 */
export class SessionResponseDto {
  id: string;
  name: string;
  siteFormat: string;
  totalHands: number;
  createdAt: Date;
  firstHand?: any; // ParsedHand object for immediate display
}

/**
 * Response DTO for listing user's sessions
 */
export class SessionListItemDto {
  id: string;
  name: string;
  siteFormat: string;
  totalHands: number;
  createdAt: Date;
}

/**
 * Response DTO for getting a specific hand within a session
 */
export class HandResponseDto {
  id: string;
  handIndex: number;
  parsedData: any; // Complete ParsedHand object
  sessionId: string;
}