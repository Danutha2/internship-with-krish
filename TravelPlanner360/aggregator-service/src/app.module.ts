import { Module } from '@nestjs/common';
import { ScatterGatherModule } from './scatter-gather/scatter-gather.module';
import { HttpModule } from '@nestjs/axios';

import { ChainingModule } from './chaining/chaining.module';
import { ChainingController } from './chaining/chaining.controller';


@Module({
  imports: [ScatterGatherModule,HttpModule, ChainingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
