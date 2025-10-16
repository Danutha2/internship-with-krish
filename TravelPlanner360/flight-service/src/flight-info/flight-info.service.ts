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
    this.logger.debug(
      `Request received to search flights | from=${from}, destination=${destination}, departTime=${departTime}`,
    );

    try {
      const flights = await this.flightRepository.find({
        where: {
          from: from,
          destination: destination,
          departTime: departTime,
        },
      });

      if (flights.length === 0) {
        this.logger.warn(
          `No flights found from=${from} to=${destination} at departTime=${departTime}`,
        );
      } else {
        this.logger.log(
          `Successfully found ${flights.length} flight(s) from=${from} to=${destination}`,
        );
      }

      return flights;
    } catch (error) {
      this.logger.error(
        `Failed to fetch flights | from=${from}, destination=${destination}, error=${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch flight information. Please try again later.',
      );
    }
  }

  async addFlightInfo(flightDTOs: flightInfo[]): Promise<flightInfo[]> {
    this.logger.log(
      `Received request to add ${flightDTOs.length} flight(s) to the database`,
    );
    this.logger.debug(`Flight DTOs Payload: ${JSON.stringify(flightDTOs)}`);

    try {
      const newFlights = this.flightRepository.create(flightDTOs);
      this.logger.debug(`Mapped DTOs to entities successfully`);

      const savedFlights = await this.flightRepository.save(newFlights);
      this.logger.log(
        ` Successfully added ${savedFlights.length} flight(s) to the database`,
      );

      return savedFlights;
    } catch (error) {
      this.logger.error(
        ` Failed to add flight(s) to the database | error=${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to add flight information. Please try again later.',
      );
    }
  }
}
