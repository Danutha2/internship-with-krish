import { Module } from '@nestjs/common';
import { ScatterGatherModule } from './scatter-gather/scatter-gather.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [ScatterGatherModule,HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
