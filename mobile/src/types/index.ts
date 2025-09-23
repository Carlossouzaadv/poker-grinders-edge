export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  type: 'cash' | 'tournament';
  location: string;
  buyIn: number;
  cashOut: number;
  startTime: Date;
  endTime?: Date;
  notes?: string;
}

export interface Tournament extends Session {
  type: 'tournament';
  tournamentName?: string;
  rebuys: number;
  addOns: number;
  bounties: number;
  prize?: number;
}

export interface CashGame extends Session {
  type: 'cash';
  blinds: string;
}

export interface Hand {
  id: string;
  sessionId: string;
  cards: string;
  position: string;
  action: string;
  moment: string;
  description?: string;
  createdAt: Date;
}

export interface Coach {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  pricePerHour: number;
  currency: 'BRL' | 'USD';
  rating: number;
  totalHours: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SessionDetail: { sessionId: string };
  NewSession: undefined;
  HandAnalysis: { handId: string };
  CoachList: undefined;
  CoachProfile: { coachId: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Sessions: undefined;
  Study: undefined;
  Coaches: undefined;
  Profile: undefined;
};