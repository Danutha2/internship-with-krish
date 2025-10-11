import { Module } from '@nestjs/common';
import { ScatterGatherService } from './scatter-gather.service';
import { ScatterGatherController } from './scatter-gather.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  providers: [ScatterGatherService],
  controllers: [ScatterGatherController]
})
export class ScatterGatherModule {}
