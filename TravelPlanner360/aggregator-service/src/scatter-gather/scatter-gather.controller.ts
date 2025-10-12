import { Controller, Get, Query } from '@nestjs/common';
import { ScatterGatherService } from './scatter-gather.service';

@Controller('v1/trips')
export class ScatterGatherController {

    constructor(private sgService:ScatterGatherService){

    }

    @Get('/search')
    tripsSearch(@Query('from') from:string, @Query('destination') destination:string, @Query('date') date:Date,@Query('location') location:string){
        return this.sgService.tripSearchV1(destination,from,date,location);
    }
}
