import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HotelInfoService } from './hotel-info.service';
import { HotelDTO } from './hotel-info.dto';
import { promises } from 'dns';

@Controller('hotel-info')
export class HotelInfoController {
    constructor(private hotelInfoService:HotelInfoService){

    }

    @Get('all')
    getAllHotelInfo(){
       return this.hotelInfoService.getAllHotelInfo();
        
    }

    @Post('create')
    createNewInfo(@Body()  hotelDTO:HotelDTO []): Promise<HotelDTO[]>{
      return this.hotelInfoService.createNewInfos(hotelDTO);
    }

    @Get('findByLocation')
    findByLocation(@Query('location') location:string){
        return this.hotelInfoService.findHotelByLocation(location)
    }
}
