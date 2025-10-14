import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherDTO } from 'src/DTO/weather.dto';
import { Weather } from 'src/Entity/weather';

@Injectable()
export class WeatherInfoService {
  private readonly logger = new Logger(WeatherInfoService.name);
  private dynamicDelayMs: number = Number(process.env.WEATHER_DELAY_MS) || 0;

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

    setDelay(ms: number) {
    if (ms < 0) {
      this.logger.warn('Delay cannot be negative. Keeping previous value.');
      return;
    }
    this.logger.log(`Updating dynamic delay from ${this.dynamicDelayMs}ms to ${ms}ms`);
    this.dynamicDelayMs = ms;
    
    return this.dynamicDelayMs
  }

  /*
   * Get all weather entries
   * Simulates delay and random failures if env variables are set
   */
  async getWeather() {
    this.logger.log('Fetching all weather entries');
    try {
      
      const failRate = Number(process.env.WEATHER_FAIL_RATE) || 0;

      // Artificial delay
      if (this.dynamicDelayMs > 0) {
        this.logger.log(`Simulating delay of ${this.dynamicDelayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, this.dynamicDelayMs));
      }

      // Random failure
      if (Math.random() < failRate) {
        this.logger.warn('Simulated weather service failure');
        throw new Error('Simulated weather service failure');
      }

      const weatherData = await this.weatherRepository.find();
      this.logger.log(`Returning ${weatherData.length} weather entries`);
      return weatherData;
    } catch (error) {
      this.logger.error(`Failed to fetch weather data: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch weather data. Please try again later.');
    }
  }

//   Create multiple weather entries
  
  async createWeatherInfor(weatherDTO: WeatherDTO[]) {
    this.logger.log(`Creating weather entries: received ${weatherDTO.length} items`);
    try {
      if (!Array.isArray(weatherDTO) || weatherDTO.length === 0) {
        this.logger.warn('weatherDTO array is empty');
        throw new BadRequestException('weatherDTO array is empty');
      }

      // Create entity instances from DTOs
      const weatherEntities = this.weatherRepository.create(weatherDTO);
      const savedWeather = await this.weatherRepository.save(weatherEntities);
      this.logger.log(`Successfully created ${savedWeather.length} weather entries`);
      return savedWeather;
    } catch (error) {
      this.logger.error(`Failed to create weather entries: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create weather entries. Please try again later.');
    }
  }
}
