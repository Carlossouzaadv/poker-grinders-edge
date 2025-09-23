import { SessionType } from '../dto/session.dto';

export interface Session {
  id: string;
  userId: string;
  type: SessionType;
  location: string;
  buyIn: number;
  cashOut?: number;
  startTime: string;
  endTime?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Tournament specific fields
  tournamentName?: string;
  rebuys?: number;
  addOns?: number;
  bounties?: number;
  prize?: number;

  // Cash game specific fields
  blinds?: string;
}