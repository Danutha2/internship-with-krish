import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from 'src/entity/entity.flight';
import { flightInfo } from './flight-info.dto';

@Injectable()
export class FlightInfoService {
  private readonly logger = new Logger(FlightInfoService.name);

  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  async findByLocation(from: string, destination: string, departTime: Date) {
    this.logger.log(`Searching flights from=${from} to=${destination} departTime=${departTime}`);
    try {
      const flights = await this.flightRepository.find({
        where: {
          from: from,
          destination: destination,
          departTime: departTime,
        },
      });
      this.logger.log(`Found ${flights.length} flights`);
      return flights;
    } catch (error) {
      this.logger.error(
        `Failed to fetch flights from ${from} to ${destination}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch flight information. Please try again later.');
    }
  }

  async addFlightInfo(flightDTOs: flightInfo[]): Promise<flightInfo[]> {
    this.logger.log(`Adding ${flightDTOs.length} flights to the database`);
    try {
      const newFlights = this.flightRepository.create(flightDTOs);
      const savedFlights = await this.flightRepository.save(newFlights);
      this.logger.log(`Successfully added ${savedFlights.length} flights`);
      return savedFlights;
    } catch (error) {
      this.logger.error(`Failed to add flights: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to add flight information. Please try again later.');
    }
  }
}
