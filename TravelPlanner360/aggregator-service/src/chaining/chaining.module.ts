import { Module } from '@nestjs/common';
import { ChainingController } from './chaining.controller';
import { ChainingService } from './chaining.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [ChainingController],
  providers: [ChainingService]
})
export class ChainingModule {}
