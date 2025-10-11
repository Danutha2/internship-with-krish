import { Module } from '@nestjs/common';
import { FlightInfoService } from './flight-info.service';
import { FlightInfoController } from './flight-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from 'src/entity/entity.flight';

@Module({
  imports:[TypeOrmModule.forFeature([Flight])],
  providers: [FlightInfoService],
  controllers: [FlightInfoController]
})
export class FlightInfoModule {}
