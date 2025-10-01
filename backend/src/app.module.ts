import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { HandHistorySessionsModule } from './modules/hand-history-sessions/hand-history-sessions.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    SessionsModule,
    HandHistorySessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
