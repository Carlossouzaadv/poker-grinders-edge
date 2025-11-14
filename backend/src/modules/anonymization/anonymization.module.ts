import { Module } from '@nestjs/common';
import { AnonymizationService } from './anonymization.service';
import { AnonymizationController } from './anonymization.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AnonymizationController],
  providers: [AnonymizationService],
  exports: [AnonymizationService],
})
export class AnonymizationModule {}
