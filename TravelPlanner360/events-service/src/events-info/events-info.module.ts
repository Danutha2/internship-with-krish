import { Module } from '@nestjs/common';
import { EventsInfoController } from './events-info.controller';
import { EventsInfoService } from './events-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../Entity/events.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Event])],
  controllers: [EventsInfoController],
  providers: [EventsInfoService]
})
export class EventsInfoModule {}
