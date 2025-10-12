import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, of } from 'rxjs';
import { flightInfo } from '../DTO/flightDTO';
import { HotelDTO2LCI } from '../DTO/hotelDTO';
import { EventDTO } from '../DTO/EventDTO';
import { ContextualTripSearchRDTO } from '../DTO/tripSearchDTO';

@Injectable()
export class ContextualService {
  constructor(private readonly httpService: HttpService) {}

  private async callService<T>(url: string): Promise<T | null> {
    const obs$ = this.httpService.get<T>(url).pipe(catchError(() => of(null)));
    const result = await firstValueFrom(obs$);
    return result ? (result as any).data : null;
  }

  async contextualV1(tripSearch: ContextualTripSearchRDTO) {
    // Step 1: Fetch flights
    const flightURL = `http://localhost:3000/flight-info/findByLocation?destination=${tripSearch.destination}&from=${tripSearch.from}&departtime=${tripSearch.date}`;
    const flights: flightInfo[] = (await this.callService<flightInfo[]>(flightURL)) ?? [];

    // Step 2: Fetch hotels
    const hotelURL = `http://localhost:3001/hotel-info/findByLocation?location=${tripSearch.destination}`;
    const hotels: HotelDTO2LCI[] = (await this.callService<HotelDTO2LCI[]>(hotelURL)) ?? [];

    // Step 3: Conditional fan-out for events based on destinationType
    let events: EventDTO[] = [];
    const isCoastal = hotels.some(hotel => hotel.destinationType === 'COASTAL');
    if (isCoastal) {
      const eventsURL = `http://localhost:3003/events-info/all`;
      events = (await this.callService<EventDTO[]>(eventsURL)) ?? [];
    }

    return {
      flights,
      hotels,
      events,
    };
  }
}
