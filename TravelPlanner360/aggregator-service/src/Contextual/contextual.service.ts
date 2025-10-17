import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, of } from 'rxjs';
import { flightInfo } from '../DTO/flightDTO';
import { HotelDTO2LCI } from '../DTO/hotelDTO';
import { EventDTO } from '../DTO/EventDTO';
import { ContextualTripSearchRDTO } from '../DTO/tripSearchDTO';

@Injectable()
export class ContextualService {
  private readonly logger = new Logger(ContextualService.name);

  constructor(private readonly httpService: HttpService) {}

  private async callService<T>(url: string): Promise<T | null> {
    try {
      this.logger.log(`Calling external service: ${url}`);
      const obs$ = this.httpService.get<T>(url).pipe(
        catchError((err) => {
          this.logger.warn(`Request failed or timed out for ${url}: ${err?.message || err}`);
          return of(null);
        }),
      );

      const result = await firstValueFrom(obs$);
      if (!result || !(result as any).data) {
        this.logger.warn(`No valid response from ${url}. Marking as degraded.`);
        return null;
      }

      this.logger.log(`Successful response from ${url}`);
      return (result as any).data;
    } catch (error) {
      this.logger.error(`Error while calling ${url}: ${error.message}`, error.stack);
      return null;
    }
  }

  async contextualV1(tripSearch: ContextualTripSearchRDTO) {
    const { destination, from, date } = tripSearch;
    this.logger.log(`Starting contextualV1 search — destination=${destination}, from=${from}, date=${date}`);

    try {
      // Step 1: Fetch flights
      const flightURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departTime=${date}`;
      const flights: flightInfo[] = (await this.callService<flightInfo[]>(flightURL)) ?? [];
      this.logger.log(`Flights fetched: ${flights.length}`);

      // Step 2: Fetch hotels
      const hotelURL = `http://localhost:3001/hotel-info/findByLocation?location=${destination}`;
      const hotels: HotelDTO2LCI[] = (await this.callService<HotelDTO2LCI[]>(hotelURL)) ?? [];
      this.logger.log(`Hotels fetched: ${hotels.length}`);

      // Step 3: Conditional fan-out for events
      let events: EventDTO[] = [];
      const isCoastal = hotels.some(hotel => hotel.destinationType === 'COASTAL');

      if (isCoastal) {
        const eventsURL = `http://localhost:3003/events-info/all?date=${date}&destination=${destination}`;
        this.logger.log(`Destination is coastal. Fetching events from: ${eventsURL}`);
        events = (await this.callService<EventDTO[]>(eventsURL)) ?? [];
        this.logger.log(`Events fetched: ${events.length}`);
      } else {
        this.logger.log(`Destination is not coastal. Skipping event fetch.`);
      }

      this.logger.log(
        `contextualV1 completed — flights=${flights.length}, hotels=${hotels.length}, events=${events.length}`,
      );

      return {
        flights,
        hotels,
        events,
      };
    } catch (error) {
      this.logger.error(`contextualV1 failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Contextual trip search failed. Please try again later.');
    }
  }
}
