import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherDTO } from 'src/DTO/weather.dto';
import { Weather } from 'src/Entity/weather';

@Injectable()
export class WeatherInfoService {
  private readonly logger = new Logger(WeatherInfoService.name);

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

  /*
   * Get all weather entries
   * Simulates delay and random failures if env variables are set
   */
  async getWeather() {
    this.logger.log('Fetching all weather entries');
    try {
      const delayMs = Number(process.env.WEATHER_DELAY_MS) || 0;
      const failRate = Number(process.env.WEATHER_FAIL_RATE) || 0;

      // Artificial delay
      if (delayMs > 0) {
        this.logger.log(`Simulating delay of ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
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
