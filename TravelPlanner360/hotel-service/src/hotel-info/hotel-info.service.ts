import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from 'src/entity/hotel.entity';
import { HotelDTO, HotelDTO2LCI } from '../DTO/hotel-info.dto';

@Injectable()
export class HotelInfoService {
  private readonly logger = new Logger(HotelInfoService.name);

  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async getAllHotelInfo() {
    this.logger.log('Fetching all hotels from database');
    try {
      const hotels = await this.hotelRepository.find();
      this.logger.log(`Fetched ${hotels.length} hotels`);
      return hotels;
    } catch (error) {
      this.logger.error(`Failed to fetch hotels: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch hotel information. Please try again later.');
    }
  }

  async createNewInfos(hotelDTOs: HotelDTO2LCI[]): Promise<HotelDTO2LCI[]> {
    this.logger.log(`Creating ${hotelDTOs.length} new hotel entries`);
    try {
      const hotels = this.hotelRepository.create(hotelDTOs);
      const savedHotels = await this.hotelRepository.save(hotels);
      this.logger.log(`Successfully created ${savedHotels.length} hotels`);
      return savedHotels;
    } catch (error) {
      this.logger.error(`Failed to create hotels: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create hotel entries. Please try again later.');
    }
  }

  async findHotelByLocation(location: string) {
    this.logger.log(`Searching hotels at location: ${location}`);
    try {
      const hotels = await this.hotelRepository.find({ where: { location } });
      this.logger.log(`Found ${hotels.length} hotels at location: ${location}`);
      return hotels;
    } catch (error) {
      this.logger.error(`Failed to fetch hotels at ${location}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch hotels by location. Please try again later.');
    }
  }

  async findByLateCheckIN(location: string, lateCheckIn: boolean) {
    this.logger.log(`Searching hotels at location=${location} with lateCheckIn=${lateCheckIn}`);
    try {
      const hotels = await this.hotelRepository.find({ where: { location, lateCheckIn } });
      this.logger.log(`Found ${hotels.length} hotels with lateCheckIn=${lateCheckIn} at location=${location}`);
      return hotels;
    } catch (error) {
      this.logger.error(
        `Failed to fetch hotels at ${location} with lateCheckIn=${lateCheckIn}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch hotels by late check-in. Please try again later.');
    }
  }
}
