import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from 'src/entity/entity.flight';
import { Repository } from 'typeorm';
import { flightInfo } from './flight-info.dto';
import { ReturningResultsEntityUpdator } from 'typeorm/query-builder/ReturningResultsEntityUpdator.js';

@Injectable()
export class FlightInfoService {
    constructor(@InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>
    ) {
    }

    async findByLocation(from: string, destination: string, departTime: Date) {
        const flightInfo = await this.flightRepository.find(
            {
                where:
                {
                    from: from,
                    destination: destination,
                    departTime: departTime
                }
            }
        )
        return flightInfo
    }

    async addFlightInfo(flightDTOs: flightInfo[]): Promise<flightInfo[]> {
        // Create entities for all DTOs
        const newFlights = this.flightRepository.create(flightDTOs);

        // Save all to the database at once
        return await this.flightRepository.save(newFlights);
    }


}
