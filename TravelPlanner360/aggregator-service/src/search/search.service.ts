import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { TripResponseV1Dto } from '../DTO/trip-response-v1.dto';
import { TripResponseV2Dto } from 'src/DTO/trip-response-v2.dto';
import { flightInfo as Flight } from '../DTO/flightDTO';
import { HotelDTO as Hotel } from '../DTO/hotelDTO';
import { WeatherDTO as Weather } from '../DTO/weather.DTO';
import { CircuitBreaker } from 'src/Circuit-Breaker/circuitBreaker';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private  weatherBreaker: CircuitBreaker<Weather[]>;

  constructor(private readonly httpService: HttpService) {
    this.weatherBreaker = new CircuitBreaker<Weather[]>({
      threshold: 0.5, // 50% failures
      requestVolume: 20, // last 20 requests
      cooldown: 30000, // 30 seconds
      halfOpenRequests: 5,
      fallback: () => [{ summary: 'unavailable', degraded: true } as any],
    });
  }

  private async callWithTimeout<T>(url: string): Promise<{ data: T | null; degraded: boolean }> {
    try {
      this.logger.log(`Calling external service: ${url}`);
      const obs$ = this.httpService.get<T>(url).pipe(
        timeout(1000),
        catchError(err => {
          this.logger.warn(`Request failed or timed out for ${url}: ${err?.message || err}`);
          return of(null);
        })
      );

      const result = await firstValueFrom(obs$);
      if (!result) {
        this.logger.warn(`No response received from ${url}. Marking as degraded.`);
        return { data: null, degraded: true };
      }

      this.logger.log(`Successful response from ${url}`);
      return { data: (result as AxiosResponse<T>).data, degraded: false };
    } catch (error) {
      this.logger.error(`Error while calling ${url}: ${error.message}`, error.stack);
      return { data: null, degraded: true };
    }
  }

  // ----------------- V1: Flights + Hotels -----------------
  async tripSearchV1(destination: string, from: string, departtime: Date, location: string): Promise<TripResponseV1Dto> {
    const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departtime=${departtime}`;
    const hotelServiceURL = `http://localhost:3001/hotel-info/findByLocation?location=${location}`;

    this.logger.log(`Starting tripSearchV1 for destination=${destination}, from=${from}, location=${location}`);

    try {
      const [flightResult, hotelResult] = await Promise.all([
        this.callWithTimeout<Flight[]>(flightServiceURL),
        this.callWithTimeout<Hotel[]>(hotelServiceURL),
      ]);

      const matchedFlights = (flightResult.data ?? []).filter(f => f.destination === location);
      const matchedHotels = (hotelResult.data ?? []).filter(h => h.location === location);

      this.logger.log(
        `V1 results — Flights: ${matchedFlights.length}, Hotels: ${matchedHotels.length}, Degraded: flight=${flightResult.degraded}, hotel=${hotelResult.degraded}`
      );

      return {
        flights: matchedFlights,
        hotels: matchedHotels,
        degraded: {
          flight: flightResult.degraded,
          hotel: hotelResult.degraded,
        },
      };
    } catch (error) {
      this.logger.error(`tripSearchV1 failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Trip search V1 failed. Please try again later.');
    }
  }

  // ----------------- Weather Service -----------------
  private async callWeatherService(url: string): Promise<Weather[]> {
    try {
      this.logger.log(`Calling weather service: ${url}`);
      const obs$ = this.httpService.get<Weather[]>(url).pipe(
        timeout(1000),
        catchError(err => {
          this.logger.warn(`Weather service failed or timed out: ${err?.message || err}`);
          return of(null);
        })
      );

      const result = await firstValueFrom(obs$);
      if (!result || !result.data) {
        this.logger.warn('Weather fetch returned empty or null data');
        throw new Error('Weather fetch failed: Empty or null response');
      }

      this.logger.log(`Weather service returned ${result.data.length} entries`);
      return result.data;
    } catch (error) {
      this.logger.error(`Error in callWeatherService: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ----------------- V2: Flights + Hotels + Weather -----------------
  async tripSearchV2(destination: string, from: string, departtime: Date, location: string): Promise<TripResponseV2Dto> {
    const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departtime=${departtime}`;
    const hotelServiceURL = `http://localhost:3001/hotel-info/findByLocation?location=${location}`;
    const weatherServiceURL = `http://localhost:3004/weather-info/getInfo?location=${location}`;

    this.logger.log(`Starting tripSearchV2 for destination=${destination}, from=${from}, location=${location}`);

    try {
      const [flightResult, hotelResult, weatherResult] = await Promise.all([
        this.callWithTimeout<Flight[]>(flightServiceURL),
        this.callWithTimeout<Hotel[]>(hotelServiceURL),
        // Wrap circuit breaker call in try/catch to handle failures gracefully
        this.weatherBreaker.exec(() =>
          this.callWeatherService(weatherServiceURL).catch(err => {
            this.logger.warn(`Weather service failed, using fallback: ${err.message}`);
            return this.weatherBreaker.getFallback();
          })
        ),
      ]);

      const matchedFlights = (flightResult.data ?? []).filter(f => f.destination === location);
      const matchedHotels = (hotelResult.data ?? []).filter(h => h.location === location);

      const weatherInfo: Weather[] = weatherResult ?? [];
      const weatherDegraded = weatherInfo.some(w => (w as any).degraded === true);

      this.logger.log(
        `V2 results — Flights: ${matchedFlights.length}, Hotels: ${matchedHotels.length}, Weather: ${weatherInfo.length}, Degraded: flight=${flightResult.degraded}, hotel=${hotelResult.degraded}, weather=${weatherDegraded}`
      );

      return {
        flights: matchedFlights,
        hotels: matchedHotels,
        weather: weatherInfo,
        degraded: {
          flight: flightResult.degraded,
          hotel: hotelResult.degraded,
          weather: weatherDegraded,
        },
      };
    } catch (error) {
      this.logger.error(`tripSearchV2 failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Trip search V2 failed. Please try again later.');
    }
  }
}
