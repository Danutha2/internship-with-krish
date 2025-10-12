import { destination } from "src/entity/hotel.entity"

export class HotelDTO{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
}

export class HotelDTO2LCI{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
    lateCheckIn:boolean
}