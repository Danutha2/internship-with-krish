// v2-search.controller.ts
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('v2/trips')
export class Searchv2Controller {
  private readonly logger = new Logger(Searchv2Controller.name);
  private static requestCount = 0;

  constructor(private readonly searchService: SearchService) {}

  @Get('/search')
  async tripsSearch(
    @Query('from') from: string,
    @Query('destination') destination: string,
    @Query('date') date: Date,
    @Query('location') location: string,
  ) {
    // Increment hit count
    Searchv2Controller.requestCount++;

    const startTime = Date.now();
    try {
      const result = await this.searchService.tripSearchV2(destination, from, date, location);
      const duration = Date.now() - startTime;

      // Log completion with duration
      this.logger.log(`V2 search endpoint hit | count=${Searchv2Controller.requestCount}| V2 search completed in ${duration}ms`);

      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      this.logger.error(`V2 search failed after ${duration}ms: ${err.message}`);
      throw err;
    }
  }
}
