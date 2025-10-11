import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelInfoModule } from './hotel-info/hotel-info.module';
import { Hotel } from './entity/hotel.entity';

@Module({
  imports: [
     TypeOrmModule.forRoot({
      type: 'sqlite',              
      database: 'hotel.sqlite', 
      entities: [Hotel],      
      synchronize: true,           
    }),
    TypeOrmModule.forFeature([]),
    HotelInfoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
