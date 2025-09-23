import { Injectable } from '@nestjs/common';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  private sessions = []; // TODO: Replace with database

  create(createSessionDto: CreateSessionDto) {
    const session = {
      id: Date.now().toString(),
      ...createSessionDto,
      createdAt: new Date(),
    };

    this.sessions.push(session);
    return session;
  }

  findAll(userId: string) {
    return this.sessions.filter(session => session.userId === userId);
  }

  findOne(id: string) {
    return this.sessions.find(session => session.id === id);
  }

  update(id: string, updateSessionDto: UpdateSessionDto) {
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

  remove(id: string) {
    const sessionIndex = this.sessions.findIndex(session => session.id === id);
    if (sessionIndex > -1) {
      return this.sessions.splice(sessionIndex, 1)[0];
    }
    return null;
  }

  endSession(id: string) {
    return this.update(id, { endTime: new Date() });
  }

  getUserStats(userId: string) {
    const userSessions = this.findAll(userId);

    const totalSessions = userSessions.length;
    const totalProfit = userSessions.reduce((sum, session) => {
      return sum + (session.cashOut - session.buyIn);
    }, 0);

    const winRate = userSessions.length > 0
      ? (userSessions.filter(s => s.cashOut > s.buyIn).length / totalSessions) * 100
      : 0;

    return {
      totalSessions,
      totalProfit,
      winRate,
      avgSession: totalSessions > 0 ? totalProfit / totalSessions : 0,
    };
  }
}