import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { WeatherInfoService } from './weather-info.service';
import { WeatherDTO } from '../DTO/weather.dto';
import { delay } from 'rxjs';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Controller('weather-info')
export class WeatherInfoController {
  constructor(private readonly weatherInfoService: WeatherInfoService) {}

  /**
   * GET /weather-info/getInfo?location=CMB&date=2025-10-12
   * Returns weather info for a given location and date
   */
  @Get('getInfo')
  getWeatherInfo(
    @Query('location') location:string
  ){ 
    return this.weatherInfoService.getWeather(location);
  }

  @Post('create')
  createWeatherInfo(@Body() weatherDTO:WeatherDTO[]){
    return this.weatherInfoService.createWeatherInfor(weatherDTO);
  }

  @Put('change')
  changeDelayTime(@Query('delayms') delayMs:number){
    return this.weatherInfoService.setDelay(delayMs);
  }

}
