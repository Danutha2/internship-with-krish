import { Body, Controller, Get, Query } from '@nestjs/common';
import { CheapestrouteService } from './cheapest-route.service';
import { TripSearchRequestDTO } from 'src/DTO/cheapestRoute.req.DTO';

@Controller('v1/trips')
export class CheapestrouteController {
    

    constructor( private chainigService:CheapestrouteService){

    }

    @Get('cheapest-route')
    getCheapestRoute(@Body() routeRequestDTO:TripSearchRequestDTO){
       return this.chainigService.getCheapestRouteV1(routeRequestDTO)
    }
}
