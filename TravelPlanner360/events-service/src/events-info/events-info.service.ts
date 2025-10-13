import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventDTO } from '../DTO/EventDTO';
import { Event } from '../Entity/events.entity';

@Injectable()
export class EventsInfoService {
  private readonly logger = new Logger(EventsInfoService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async createEvents(events: EventDTO[]): Promise<EventDTO[]> {
    this.logger.log(`Creating ${events.length} events`);
    try {
      const newEvents = this.eventRepository.create(events);
      const savedEvents = await this.eventRepository.save(newEvents);
      this.logger.log(`Successfully created ${savedEvents.length} events`);
      return savedEvents;
    } catch (error) {
      this.logger.error(`Failed to create events: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create events. Please try again later.');
    }
  }

  async getAllEvents(): Promise<Event[]> {
    this.logger.log('Fetching all events from database');
    try {
      const events = await this.eventRepository.find();
      this.logger.log(`Fetched ${events.length} events`);
      return events;
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch events. Please try again later.');
    }
  }
}
