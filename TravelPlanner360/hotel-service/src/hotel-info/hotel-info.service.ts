import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from 'src/entity/hotel.entity';
import { Repository } from 'typeorm';
import { HotelDTO, HotelDTO2LCI } from '../DTO/hotel-info.dto';

@Injectable()
export class HotelInfoService {
    
    constructor(
        @InjectRepository(Hotel)
        private readonly hotelRepository: Repository<Hotel>) {
    }

    async getAllHotelInfo() {
        return this.hotelRepository.find();
    }

    async createNewInfos(hotelDTOs: HotelDTO2LCI[]): Promise<HotelDTO2LCI[]> {
        // Create entity instances for all DTOs
        const hotels = this.hotelRepository.create(hotelDTOs);

        // Save all instances to the database at once
        return await this.hotelRepository.save(hotels);
    }


    async findHotelByLocation(location: string) {
        const hotel = await this.hotelRepository.find({
            where: { location }
        })

        console.log(hotel)

        return hotel
    }

   async findByLateCheckIN(location: string, lateCheckIn: boolean) {
    const hotels = await this.hotelRepository.find({
        where: {
            location,
            lateCheckIn: lateCheckIn
        }
    });
    console.log(hotels)
    return hotels;
}

}
