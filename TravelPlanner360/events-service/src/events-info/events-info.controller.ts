import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventsInfoService } from './events-info.service';
import { EventDTO } from 'src/DTO/EventDTO';

@Controller('events-info')
export class EventsInfoController {
    constructor(private readonly eventsService:EventsInfoService){

    }
    @Get('all')
    getAllEventsInfo(){
        return this.eventsService.getAllEvents()
    }

    @Post('create')
    createEvents(@Body() events:EventDTO []){
        return this.eventsService.createEvents(events);

    }
}
