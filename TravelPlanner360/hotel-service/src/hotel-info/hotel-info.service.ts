import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
  ) { }

  async getAllHotelInfo() {
    this.logger.log('Fetching all hotels from database...');
    try {
      const hotels = await this.hotelRepository.find();
      this.logger.log(`Fetched ${hotels.length} hotels successfully.`);
      return hotels;
    } catch (error) {
      this.logger.error(`Failed to fetch hotels: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch hotel information. Please try again later.');
    }
  }

  async createNewInfos(hotelDTOs: HotelDTO2LCI[]): Promise<HotelDTO2LCI[]> {
    this.logger.log(`Creating ${hotelDTOs.length} new hotel entries...`);
    try {
      const hotels = this.hotelRepository.create(hotelDTOs);
      const savedHotels = await this.hotelRepository.save(hotels);
      this.logger.log(`Successfully created ${savedHotels.length} hotels.`);
      return savedHotels;
    } catch (error) {
      this.logger.error(`Failed to create hotels: ${error.message}`);
      throw new InternalServerErrorException('Failed to create hotel entries. Please try again later.');
    }
  }

  async findHotelByLocation(location: string) {
    this.logger.log(`Searching hotels at location: ${location}`);
    try {
      const hotels = await this.hotelRepository.find({ where: { location } });

      if (!hotels || hotels.length === 0) {
        this.logger.warn(`No hotels found at location: ${location}`);
        throw new NotFoundException(`No hotels found at location: ${location}`);
      }

      this.logger.log(`Found ${hotels.length} hotel(s) at location: ${location}`);
      return hotels;
    } catch (error) {
      if (error instanceof NotFoundException) {

        throw error;
      }
    }
  }


  async findHotelsByLocationAndDate(location?: string, date?: Date) {
    this.logger.log(`Searching hotels with filters - location: ${location}, date: ${date}`);
    try {
      // Build dynamic where object
      const where: any = {};
      if (location) where.location = location;
      if (date){
        const departDate = new Date(date); 

        const start = new Date(departDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(departDate);
        end.setHours(23, 59, 59, 999);

        where.date = departDate;

      }  

      const hotels = await this.hotelRepository.find({ where });

      if (!hotels || hotels.length === 0) {
        this.logger.warn(`No hotels found with the given filters - location: ${location}, date: ${date}`);
        throw new NotFoundException(`No hotels found with the provided filters.`);
      }

      this.logger.log(`Found ${hotels.length} hotel(s) with the given filters.`);
      return hotels;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to fetch hotels with filters - location: ${location}, date: ${date}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to fetch hotels. Please try again later.');
    }
  }

}
