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
      //Get all flights
      const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departTime=${date}`;
      const flights: flightInfo[] = (await this.callService<flightInfo[]>(flightServiceURL)) ?? [];
      this.logger.log(`Flights fetched: ${flights.length}`);

      if (!flights || flights.length === 0) {
        this.logger.warn('No flights found for given search parameters');
        return { flight: null, hotel: null, message: 'No flights available' };
      }

      // Pick the cheapest flight
      const cheapestFlight = flights.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
      this.logger.log(`Cheapest flight selected | Price=${cheapestFlight.price}`);

      // Assume default hotel check-in time is 20:00
      const defaultCheckInHour = 20;
      const arrivalHour = new Date(cheapestFlight.arrivetime).getHours();
      const needLateCheckIn = arrivalHour >= defaultCheckInHour;
      this.logger.debug(`Need late check In ${needLateCheckIn}`)

      this.logger.log(`Arrival hour: ${arrivalHour}, needLateCheckIn=${needLateCheckIn}`);
      const lateCheckInFlag = needLateCheckIn ? 1 : 0;

      // Step 2: Fetch hotels based on lateCheckIn flag
      const hotelServiceURL = `http://localhost:3001/hotel-info/findLateCheckIn?location=${destination}&lateCheckIn=${lateCheckInFlag}`;
      const hotels: HotelDTO[] = (await this.callService<HotelDTO[]>(hotelServiceURL)) ?? [];
      this.logger.log(`Hotels fetched: ${hotels.length}`);

      if (!hotels || hotels.length === 0) {
        this.logger.warn('No hotels found for this arrival time');
        return { flight: cheapestFlight, hotel: null, message: 'No hotels available for this arrival time' };
      }

      // Pick the cheapest late-check-in hotel (if any)
      let lateCheckInHotels: any[] = [];

      if (lateCheckInFlag) {
        // Pick only hotels that allow late check-in
        lateCheckInHotels = hotels.filter(hotel => hotel.lateCheckIn === needLateCheckIn);
        this.logger.log(`Late check-in hotels found: ${lateCheckInHotels.length}`);
      } else {
        // No filter, return all hotels
        lateCheckInHotels = hotels;
        this.logger.log(`Late check-in flag is false. Returning all hotels: ${lateCheckInHotels.length}`);
      }



      return {
        flight: cheapestFlight,
        hotel: lateCheckInHotels,
      };
    } catch (error) {
      this.logger.error(`getCheapestRouteV1 failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Cheapest route search failed. Please try again later.');
    }
  }
}
