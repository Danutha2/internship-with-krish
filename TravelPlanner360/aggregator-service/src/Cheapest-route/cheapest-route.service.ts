import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { flightInfo } from '../DTO/flightDTO';
import { HotelDTO } from '../DTO/hotelDTO';
import { TripSearchRequestDTO } from '../DTO/cheapestRoute.req.DTO';

@Injectable()
export class CheapestrouteService {
  private readonly logger = new Logger(CheapestrouteService.name);

  constructor(private readonly httpService: HttpService) { }

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
      if (!result || !(result as AxiosResponse<T>).data) {
        this.logger.warn(`No valid response received from ${url}. Marking as degraded.`);
        return null;
      }

      this.logger.log(`Successful response from ${url}`);
      return (result as AxiosResponse<T>).data;
    } catch (error) {
      this.logger.error(`Error while calling ${url}: ${error.message}`, error.stack);
      return null;
    }
  }

  async getCheapestRouteV1(routeReq: TripSearchRequestDTO) {
  const { destination, from, date } = routeReq;
  this.logger.log(`Starting getCheapestRouteV1 — destination=${destination}, from=${from}, date=${date}`);

  try {
    // Step 1: Fetch flights
    const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departTime=${date}`;
    const flights: flightInfo[] = (await this.callService<flightInfo[]>(flightServiceURL)) ?? [];
    this.logger.log(`Flights fetched: ${flights.length}`);

    if (!flights || flights.length === 0) {
      this.logger.warn('No flights found for given search parameters');
      return { flight: null, hotel: null, message: 'No flights available' };
    }

    // Pick the cheapest flight
    const cheapestFlight = flights.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
    const arrivalHour = new Date(cheapestFlight.arrivetime).getHours();
    this.logger.log(`Cheapest flight selected | Price=${cheapestFlight.price}, Arrival Hour=${arrivalHour}`);

    // Step 2: Fetch hotels
    const hotelServiceURL = `http://localhost:3001/hotel-info/findLateCheckIn?location=${destination}&date=${date}`;
    let hotels: HotelDTO[] = (await this.callService<HotelDTO[]>(hotelServiceURL)) ?? [];
    this.logger.log(`Hotels fetched: ${hotels.length}`);

    if (!hotels || hotels.length === 0) {
      this.logger.warn('No hotels found for this location/date');
      return { flight: cheapestFlight, hotel: null, message: 'No hotels available for this location/date' };
    }

    // Step 3: Filter hotels based on arrival time and late check-in
    const filteredHotels = hotels.filter(hotel => {
      this.logger.debug(`Checking hotel: ${hotel.name}|Arrival TIme=${arrivalHour} | Check-in Time=${hotel.checkInTime}, LateCheckIn=${hotel.lateCheckIn}`);
      if (arrivalHour <= hotel.checkInTime) {
        this.logger.debug(`Flight arrives on time. Hotel "${hotel.name}" is fine.`);
        return true;
      } else {
        const allowed = hotel.lateCheckIn === true;
        this.logger.debug(`Flight arrives late. Hotel "${hotel.name}" late check-in allowed? ${allowed}`);
        return allowed;
      }
    });

    if (!filteredHotels || filteredHotels.length === 0) {
      this.logger.warn('No hotels available for the flight arrival time');
      return { flight: cheapestFlight, hotel: null, message: 'No hotels available for the flight arrival time' };
    }

    this.logger.log(`Hotels available after arrival check: ${filteredHotels.length}`);

    return {
      flight: cheapestFlight,
      hotel: filteredHotels,
    };
  } catch (error) {
    this.logger.error(`getCheapestRouteV1 failed: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Cheapest route search failed. Please try again later.');
  }
}

}
