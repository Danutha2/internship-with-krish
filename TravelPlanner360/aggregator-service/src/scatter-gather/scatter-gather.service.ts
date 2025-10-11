import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { TripResponseV1Dto } from './DTO/trip-response-v1.dto';
import { HotelDTO as Hotel } from './DTO/hotelDTO';
import { flightInfo as flight } from './DTO/flightDTO';

@Injectable()
export class ScatterGatherService {
  constructor(private readonly httpService: HttpService) {}

  private async callWithTimeout<T>(url: string): Promise<{ data: T | null; degraded: boolean }> {
    const obs$ = this.httpService.get<T>(url).pipe(
      timeout(1000),
      catchError(() => of(null))
    );
    const result = await firstValueFrom(obs$);
    if (result === null) return { data: null, degraded: true };
    return { data: (result as AxiosResponse<T>).data, degraded: false };
  }

  // 🔹 Version 1
 async tripSearchV1(destination: string, from: string, departtime: Date, location: string): Promise<TripResponseV1Dto> {
  const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departtime=${departtime}`;
  const hotelServiceURL = `http://localhost:3001/hotel-info/findByLocation?location=${location}`;

  const [flightResult, hotelResult] = await Promise.all([
    this.callWithTimeout(flightServiceURL),
    this.callWithTimeout(hotelServiceURL),
  ]);

  // Only include flights and hotels where flight destination matches hotel location
const matchedFlights = (flightResult.data as flight [] )?.filter(f => f.destination === location) ?? [];
const matchedHotels = (hotelResult.data as Hotel [] )?.filter(h => h.location === location) ?? [];


  const tripSearchV1Res: TripResponseV1Dto = {
    flights: matchedFlights,
    hotels: matchedHotels,
    degraded: {
      flight: flightResult.degraded,
      hotel: hotelResult.degraded,
    },
  };

  return tripSearchV1Res;
}

}
