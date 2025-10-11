// trip-response-v2.dto.ts
export class TripResponseV2Dto {
  flights: any;
  hotels: any;
  weather: any;
  degraded: {
    flight: boolean;
    hotel: boolean;
    weather: boolean;
  };
}
