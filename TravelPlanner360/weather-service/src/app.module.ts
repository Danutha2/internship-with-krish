import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherInfoModule } from './weather-info/weather-info.module';
import { Weather } from './Entity/weather';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',              
      database: 'weaher.sqlite', 
      entities: [Weather],      
      synchronize: true,           
    }),
    TypeOrmModule.forFeature([]),
    WeatherInfoModule,
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
