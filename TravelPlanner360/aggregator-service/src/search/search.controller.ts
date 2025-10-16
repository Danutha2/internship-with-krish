// v1-search.controller.ts
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('v1/trips')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);
  public static requestCount = 0;

  constructor(private readonly sgService: SearchService) {}

  @Get('/search')
  async tripsSearch(
    @Query('from') from: string,
    @Query('destination') destination: string,
    @Query('date') date: Date,
  ) {
    SearchController.requestCount++;
    this.logger.log(
      `V1 search endpoint hit | count=${SearchController.requestCount} | from=${from} | destination=${destination} | date=${date} `,
    );

    const result = await this.sgService.tripSearchV1(destination, from, date);

    // Log degraded states for each service
    this.logger.warn(
      `Degraded status | flight=${result.degraded.flight} | hotel=${result.degraded.hotel}`,
    );

    return result;
  }
}
