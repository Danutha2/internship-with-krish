import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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
  ) { }

  async createEvents(events: EventDTO[]): Promise<EventDTO[]> {
    this.logger.log(`Received request to create ${events.length} events`);

    if (!Array.isArray(events) || events.length === 0) {
      this.logger.warn('Empty or invalid events array received');
      throw new BadRequestException('Event data cannot be empty');
    }

    try {
      this.logger.debug(`Creating event entities from DTOs`);
      const newEvents = this.eventRepository.create(events);

      this.logger.debug('Saving new events to database');
      const savedEvents = await this.eventRepository.save(newEvents);

      this.logger.log(`Successfully created ${savedEvents.length} events`);
      return savedEvents;
    } catch (error) {
      this.logger.error(`Failed to create events: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create events. Please try again later.');
    }
  }

  async getEvents(date: Date, destination: string): Promise<Event[]> {
    this.logger.log('Received request to fetch all events from database');
    try {
      this.logger.debug('Executing find() on eventRepository');
      const events = await this.eventRepository.find({
        where: {
          date,
          destination
        }
      });

      if (events.length === 0) {
        this.logger.warn('No events found in the database');
      } else {
        this.logger.log(`Fetched ${events.length} events successfully`);
      }

      return events;
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch events. Please try again later.');
    }
  }
}
