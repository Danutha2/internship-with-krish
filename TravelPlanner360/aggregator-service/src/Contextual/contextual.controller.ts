import { Body, Controller, Get } from '@nestjs/common';
import { ContextualService } from './contextual.service';
import { ContextualTripSearchRDTO } from 'src/DTO/tripSearchDTO';

@Controller('/v1/trips/')
export class ContextualController {

    constructor(private contextualService:ContextualService){

    }

    @Get('contextual')
    getContextual(@Body() tripSearch:ContextualTripSearchRDTO){
        return this.contextualService.contextualV1(tripSearch);
    }

}
