import { Injectable } from '@nestjs/common';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';
import { Session } from './interfaces/session.interface';

@Injectable()
export class SessionsService {
  private sessions: Session[] = []; // TODO: Replace with database

  create(createSessionDto: CreateSessionDto): Session {
    const session: Session = {
      id: Date.now().toString(),
      ...createSessionDto,
      createdAt: new Date(),
    };

    this.sessions.push(session);
    return session;
  }

  findAll(userId: string): Session[] {
    return this.sessions.filter(session => session.userId === userId);
  }

  findOne(id: string): Session | undefined {
    return this.sessions.find(session => session.id === id);
  }

  update(id: string, updateSessionDto: UpdateSessionDto): Session | null {
    const sessionIndex = this.sessions.findIndex(session => session.id === id);
    if (sessionIndex > -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        ...updateSessionDto,
        updatedAt: new Date(),
      };
      return this.sessions[sessionIndex];
    }
    return null;
  }

  remove(id: string): Session | null {
    const sessionIndex = this.sessions.findIndex(session => session.id === id);
    if (sessionIndex > -1) {
      return this.sessions.splice(sessionIndex, 1)[0];
    }
    return null;
  }

  endSession(id: string): Session | null {
    return this.update(id, { endTime: new Date().toISOString() });
  }

  getUserStats(userId: string) {
    const userSessions = this.findAll(userId);

    const totalSessions = userSessions.length;
    const totalProfit = userSessions.reduce((sum, session) => {
      const cashOut = session.cashOut || 0;
      return sum + (cashOut - session.buyIn);
    }, 0);

    const winRate = userSessions.length > 0
      ? (userSessions.filter(s => (s.cashOut || 0) > s.buyIn).length / totalSessions) * 100
      : 0;

    return {
      totalSessions,
      totalProfit,
      winRate,
      avgSession: totalSessions > 0 ? totalProfit / totalSessions : 0,
    };
  }
}