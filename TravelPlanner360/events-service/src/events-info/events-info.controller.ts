import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EventsInfoService } from './events-info.service';
import { EventDTO } from 'src/DTO/EventDTO';

@Controller('events-info')
export class EventsInfoController {
    constructor(private readonly eventsService:EventsInfoService){

    }
    @Get('all')
    getEventsInfo(@Query('date') date:Date,@Query('destination') destination:string){
        return this.eventsService.getEvents(date,destination)
    }

    @Post('create')
    createEvents(@Body() events:EventDTO []){
        return this.eventsService.createEvents(events);

    }
}
