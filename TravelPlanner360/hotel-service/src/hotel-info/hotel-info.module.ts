import { Module } from '@nestjs/common';
import { HotelInfoService } from './hotel-info.service';
import { HotelInfoController } from './hotel-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from 'src/entity/hotel.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Hotel])],
  providers: [HotelInfoService],
  controllers: [HotelInfoController]
})
export class HotelInfoModule {

}
