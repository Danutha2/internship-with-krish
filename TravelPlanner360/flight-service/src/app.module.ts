import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entity/entity.flight';
import { FlightInfoModule } from './flight-info/flight-info.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',              
      database: 'flight.sqlite', 
      entities: [Flight],      
      synchronize: true,           
    }),
    TypeOrmModule.forFeature([]),
    FlightInfoModule,
    
  ],
  controllers: [],
  providers: [],
})


export class AppModule {}
