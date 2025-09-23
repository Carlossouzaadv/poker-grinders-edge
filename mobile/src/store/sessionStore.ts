import { create } from 'zustand';
import { Session, Tournament, CashGame } from '../types';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  addSession: (session: Omit<Session, 'id' | 'userId'>) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  getCurrentSession: () => Session | null;
  endCurrentSession: () => void;
  getSessions: () => Session[];
  getTotalProfit: () => number;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,

  addSession: (sessionData) => {
    const newSession: Session = {
      ...sessionData,
      id: Date.now().toString(),
      userId: '1', // TODO: Get from auth store
    };

    set((state) => ({
      sessions: [...state.sessions, newSession],
      currentSession: newSession
    }));
  },

  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map(session =>
        session.id === id ? { ...session, ...updates } : session
      ),
      currentSession: state.currentSession?.id === id
        ? { ...state.currentSession, ...updates }
        : state.currentSession
    }));
  },

  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter(session => session.id !== id),
      currentSession: state.currentSession?.id === id ? null : state.currentSession
    }));
  },

  getCurrentSession: () => {
    return get().currentSession;
  },

  endCurrentSession: () => {
    const currentSession = get().currentSession;
    if (currentSession) {
      get().updateSession(currentSession.id, { endTime: new Date() });
      set({ currentSession: null });
    }
  },

  getSessions: () => {
    return get().sessions;
  },

  getTotalProfit: () => {
    const sessions = get().sessions;
    return sessions.reduce((total, session) => {
      const profit = session.cashOut - session.buyIn;
      return total + profit;
    }, 0);
  },
}));