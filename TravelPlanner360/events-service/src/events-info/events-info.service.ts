import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDTO } from '../DTO/EventDTO';
import { Repository } from 'typeorm';
import { Event } from '../Entity/events.entity';

@Injectable()
export class EventsInfoService {

    constructor(@InjectRepository(Event)
    private eventRepository: Repository<Event>
    ) { }


    async createEvents(events: EventDTO[]): Promise<EventDTO[]> {
        const newEvents = this.eventRepository.create(events)
        return await this.eventRepository.save(newEvents);
    }

    async getAllEvents(): Promise<Event[]> {
        return await this.eventRepository.find();
    }


}
