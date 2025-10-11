import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FlightInfoService } from './flight-info.service';
import { flightInfo } from './flight-info.dto';

@Controller('flight-info')
export class FlightInfoController {

    constructor(private flightService:FlightInfoService){

    }

    @Get('findByLocation')
    getFlightInfoByLocation(@Query('destination') destination:string, @Query('from') from:string,@Query('departTime') departTime:Date){
        console.log("FIND Method called")
       return this.flightService.findByLocation(from,destination,departTime)
    }
    
    @Post('create')
    createFlightInfo(@Body() flights: flightInfo[]): Promise<flightInfo[]>{
        console.log("CREATE Method called")
       return this.flightService.addFlightInfo( flights)
    }

}
