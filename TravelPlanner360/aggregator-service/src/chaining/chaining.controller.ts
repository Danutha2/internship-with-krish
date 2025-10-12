import { Body, Controller, Get, Query } from '@nestjs/common';
import { ChainingService } from './chaining.service';
import { RouteRequestDTO } from 'src/DTO/cheapestRoute.req.DTO';

@Controller('v1/trips')
export class ChainingController {
    

    constructor( private chainigService:ChainingService){

    }

    @Get('cheapest-route')
    getCheapestRoute(@Body() routeRequestDTO:RouteRequestDTO){
       return this.chainigService.getCheapestRoute1(routeRequestDTO)
    }
}
