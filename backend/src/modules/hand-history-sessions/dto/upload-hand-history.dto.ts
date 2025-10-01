import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

/**
 * Supported poker site formats for hand history parsing
 */
export enum SiteFormat {
  POKERSTARS = 'PokerStars',
  GGPOKER = 'GGPoker',
  PARTYPOKER = 'PartyPoker',
  IGNITION = 'Ignition',
}

/**
 * DTO for uploading hand history text
 * Receives the complete raw hand history and optional session name/site format
 */
export class UploadHandHistoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Hand history text cannot be empty' })
  rawHandHistory: string;

  @IsOptional()
  @IsString()
  name?: string; // Optional descriptive name (e.g., "Tournament #123456")

  @IsOptional()
  @IsEnum(SiteFormat, {
    message:
      'Site format must be one of: PokerStars, GGPoker, PartyPoker, Ignition',
  })
  siteFormat?: SiteFormat; // Optional site hint for parsing
}