import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('v1/trips')
export class SearchController {

    constructor(private sgService:SearchService){

    }

    @Get('/search')
    tripsSearch(@Query('from') from:string, @Query('destination') destination:string, @Query('date') date:Date,@Query('location') location:string){
        return this.sgService.tripSearchV1(destination,from,date,location);
    }
}
