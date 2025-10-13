import { Module } from '@nestjs/common';
import { WeatherInfoController } from './weather-info.controller';
import { WeatherInfoService } from './weather-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from 'src/Entity/weather';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Makes the config available globally
    envFilePath: '.env', // Optional: specify .env file path
  }), TypeOrmModule.forFeature([Weather])],
  controllers: [WeatherInfoController],
  providers: [WeatherInfoService]
})
export class WeatherInfoModule { }
