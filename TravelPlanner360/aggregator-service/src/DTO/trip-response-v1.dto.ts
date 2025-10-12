// trip-response-v1.dto.ts
export class TripResponseV1Dto {
  flights: any;
  hotels: any;
  degraded: {
    flight: boolean;
    hotel: boolean;
  };
}
