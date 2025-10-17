import { Injectable, Logger, InternalServerErrorException, BadRequestException, DescriptionAndOptions } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { WeatherDTO } from 'src/DTO/weather.dto';
import { Weather } from 'src/Entity/weather';

@Injectable()
export class WeatherInfoService {
  private readonly logger = new Logger(WeatherInfoService.name);
  private dynamicDelayMs: number = Number(process.env.WEATHER_DELAY_MS) || 0;

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) { }

  setDelay(ms: number) {
    if (ms < 0) {
      this.logger.warn(` Invalid delay value received: ${ms}ms. Keeping previous delay: ${this.dynamicDelayMs}ms`);
      return this.dynamicDelayMs;
    }
    this.logger.log(`Updating dynamic delay from ${this.dynamicDelayMs}ms to ${ms}ms`);
    this.dynamicDelayMs = ms;
    return this.dynamicDelayMs;
  }


  //Get all weather entries
  async getWeather(location: string) {
    this.logger.log(' Received request to fetch all weather entries');
    try {
      const failRate = Number(process.env.WEATHER_FAIL_RATE) || 0;
      this.logger.debug(` Current config — Delay: ${this.dynamicDelayMs}ms | Fail Rate: ${failRate}`);

      // // Artificial delay
      // if (this.dynamicDelayMs > 0) {
      //   this.logger.debug(` Simulating delay of ${this.dynamicDelayMs}ms`);
      //   await new Promise(resolve => setTimeout(resolve, this.dynamicDelayMs));
      // }

      // // Random failure simulation
      // if (Math.random() < failRate) {
      //   this.logger.warn(' Simulated weather service failure triggered');
      //   throw new Error('Simulated weather service failure');
      // }


      const weatherData = await this.weatherRepository.find({
        where: { location
         }
      });
      this.logger.log(` Successfully fetched ${weatherData.length} weather entries`);
      return weatherData;

    } catch (error) {
      this.logger.error(` Failed to fetch weather data: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch weather data. Please try again later.');
    }
  }

  // Create multiple weather entries
  async createWeatherInfor(weatherDTO: WeatherDTO[]) {
    this.logger.log(` Received request to create weather entries: ${weatherDTO?.length || 0} items`);
    try {
      if (!Array.isArray(weatherDTO) || weatherDTO.length === 0) {
        this.logger.warn(' Provided weatherDTO array is empty or invalid');
        throw new BadRequestException('weatherDTO array is empty');
      }

      this.logger.debug(' Creating Weather entity instances from DTOs');
      const weatherEntities = this.weatherRepository.create(weatherDTO);

      this.logger.debug(` Saving ${weatherEntities.length} weather entries to the database`);
      const savedWeather = await this.weatherRepository.save(weatherEntities);

      this.logger.log(` Successfully created ${savedWeather.length} weather entries`);
      return savedWeather;

    } catch (error) {
      this.logger.error(` Failed to create weather entries: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create weather entries. Please try again later.');
    }
  }
}
