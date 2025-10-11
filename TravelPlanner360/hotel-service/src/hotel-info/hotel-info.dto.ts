import { destination } from "src/entity/hotel.entity"

export class HotelDTO{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
}