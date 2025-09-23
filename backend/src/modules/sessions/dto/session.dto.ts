import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum SessionType {
  CASH = 'cash',
  TOURNAMENT = 'tournament',
}

export class CreateSessionDto {
  @IsString()
  userId: string;

  @IsEnum(SessionType)
  type: SessionType;

  @IsString()
  location: string;

  @IsNumber()
  buyIn: number;

  @IsNumber()
  @IsOptional()
  cashOut?: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Tournament specific fields
  @IsString()
  @IsOptional()
  tournamentName?: string;

  @IsNumber()
  @IsOptional()
  rebuys?: number;

  @IsNumber()
  @IsOptional()
  addOns?: number;

  @IsNumber()
  @IsOptional()
  bounties?: number;

  @IsNumber()
  @IsOptional()
  prize?: number;

  // Cash game specific fields
  @IsString()
  @IsOptional()
  blinds?: string;
}

export class UpdateSessionDto {
  @IsNumber()
  @IsOptional()
  cashOut?: number;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  rebuys?: number;

  @IsNumber()
  @IsOptional()
  addOns?: number;

  @IsNumber()
  @IsOptional()
  bounties?: number;

  @IsNumber()
  @IsOptional()
  prize?: number;
}