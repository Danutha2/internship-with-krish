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
import { ConfigService } from '@nestjs/config';
import { config } from 'process';


@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private weatherBreaker: CircuitBreaker<Weather[]>;


  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService,) {
    this.weatherBreaker = new CircuitBreaker<Weather[]>({
      threshold: this.configService.get<number>('CIRCUIT_THRESHOLD') || 0.5,           // default 50%
      requestVolume: this.configService.get<number>('CIRCUIT_REQUEST_VOLUME') || 50,   // keep history of 50
      minRequestsBeforeEvaluate: this.configService.get<number>('CIRCUIT_MIN_REQUESTS_BEFORE') || 20, // 👈 new line
      cooldown: this.configService.get<number>('CIRCUIT_COOLDOWN') || 30000,           // default 30s
      halfOpenRequests: this.configService.get<number>('CIRCUIT_HALF_OPEN_REQUESTS') || 5,
      fallback: () => {
        this.logger.warn('Using fallback weather data');
        return [{ summary: 'Weather data unavailable', degraded: true } as any];
      },
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
        this.logger.log(`No response received from ${url}. Marking as degraded.`);
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

    this.logger.debug(`Starting tripSearchV1 for destination=${destination}, from=${from}, location=${location}`);

    try {
      //promise all settled
      const [flightResult, hotelResult] = await Promise.all([
        this.callWithTimeout<Flight[]>(flightServiceURL),
        this.callWithTimeout<Hotel[]>(hotelServiceURL),
      ]);

      const matchedFlights = (flightResult.data ?? []).filter(f => f.destination === location);
      const matchedHotels = (hotelResult.data ?? []).filter(h => h.location === location);

      this.logger.debug(
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

  // ----------------- Weather Service  -----------------
  private async callWeatherService(url: string): Promise<Weather[]> {
    this.logger.log(`Calling weather service: ${url}`);

    const obs$ = this.httpService.get<Weather[]>(url).pipe(
      timeout(1000),
      catchError(err => {
        this.logger.warn(`Weather service request failed: ${err?.message || err}`);

        throw new Error(`Weather service error: ${err?.message || 'Request failed'}`);
      })
    ); null

    const result = await firstValueFrom(obs$);

    if (!result || !result.data || result.data.length === 0) {
      this.logger.warn('Weather fetch returned empty or  data');
      throw new Error('Weather service returned empty response');
    }

    this.logger.debug(`Weather service returned ${result.data.length} entries`);
    return result.data;
  }

  // ----------------- V2: Flights + Hotels + Weather -----------------
  async tripSearchV2(destination: string, from: string, departtime: Date, location: string): Promise<TripResponseV2Dto> {
    const flightServiceURL = `http://localhost:3000/flight-info/findByLocation?destination=${destination}&from=${from}&departtime=${departtime}`;
    const hotelServiceURL = `http://localhost:3001/hotel-info/findByLocation?location=${location}`;
    const weatherServiceURL = `http://localhost:3004/weather-info/getInfo?location=${location}`;

    this.logger.debug(`Starting tripSearchV2 for destination=${destination}, from=${from}, location=${location}`);

    try {
      const [flightResult, hotelResult, weatherResult] = await Promise.all([
        this.callWithTimeout<Flight[]>(flightServiceURL),
        this.callWithTimeout<Hotel[]>(hotelServiceURL),
        // Circuit breaker handles all errors and fallback logic
        this.weatherBreaker.exec(() => this.callWeatherService(weatherServiceURL)),
      ]);

      const matchedFlights = (flightResult.data ?? []).filter(f => f.destination === location);
      const matchedHotels = (hotelResult.data ?? []).filter(h => h.location === location);

      const weatherInfo: Weather[] = weatherResult ?? [];
      const weatherDegraded = weatherInfo.some(w => (w as any).degraded === true);

      this.logger.debug(
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