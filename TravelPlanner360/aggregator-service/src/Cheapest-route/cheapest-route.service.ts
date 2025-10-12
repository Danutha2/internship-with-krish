import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { flightInfo } from '../DTO/flightDTO';
import { HotelDTO } from '../DTO/hotelDTO';
import { TripSearchRequestDTO } from '../DTO/cheapestRoute.req.DTO';

@Injectable()
export class CheapestrouteService {
  constructor(private readonly httpService: HttpService) {}

  private async callService<T>(url: string): Promise<T | null> {
    const obs$ = this.httpService.get<T>(url).pipe(
      catchError(() => of(null))
    );
    const result = await firstValueFrom(obs$);
    return result ? (result as AxiosResponse<T>).data : null;
  }

  async getCheapestRouteV1(routeReq: TripSearchRequestDTO) {
    // Step 1: Get all flights
    const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${routeReq.destination}&from=${routeReq.from}&departtime=${routeReq.date}`;
    const flights: flightInfo[] = (await this.callService<flightInfo[]>(flightServiceURL)) ?? [];

    if (!flights || flights.length === 0) {
      return { flight: null, hotel: null, message: 'No flights available' };
    }

    // Pick the cheapest flight
    const cheapestFlight = flights.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));

    // Assume default hotel check-in time is 20:00
    const defaultCheckInHour = 20;
    const arrivalHour = new Date(cheapestFlight.arrivetime).getHours();

    // Step 2: Determine if late check-in hotels are needed
    const needLateCheckIn = arrivalHour >= defaultCheckInHour;
    console.log(`NeedLateCheckIn ${needLateCheckIn}`);

    const nums = needLateCheckIn ? 0 : 1;

    // Query hotel-service with lateCheckIn flag if needed
    const hotelServiceURL = `http://localhost:3001/hotel-info/findLateCheckIn?location=${routeReq.destination}&lateCheckIn=${nums}`;
    const hotels: HotelDTO[] = (await this.callService<HotelDTO[]>(hotelServiceURL)) ?? [];

    if (!hotels || hotels.length === 0) {
      return { flight: cheapestFlight, hotel: null, message: 'No hotels available for this arrival time' };
    }

    // Pick the cheapest hotel
    const lateCheckInHotel = hotels.filter(hotel=>hotel.lateCheckIn==true)

    return {
      flight: cheapestFlight,
      hotel: lateCheckInHotel,
    };
  }
}
