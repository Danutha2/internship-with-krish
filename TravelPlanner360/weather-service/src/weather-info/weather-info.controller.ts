import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WeatherInfoService } from './weather-info.service';
import { WeatherDTO } from '../DTO/weather.dto';

@Controller('weather-info')
export class WeatherInfoController {
  constructor(private readonly weatherInfoService: WeatherInfoService) {}

  /**
   * GET /weather-info/getInfo?location=CMB&date=2025-10-12
   * Returns weather info for a given location and date
   */
  @Get('getInfo')
  getWeatherInfo(
    @Query('date') date: Date, // Expecting ISO string
  ){
    return this.weatherInfoService.getWeather();
  }

  @Post('create')
  createWeatherInfo(@Body() weatherDTO:WeatherDTO[]){
    return this.weatherInfoService.createWeatherInfor(weatherDTO);
  }
}
