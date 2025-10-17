import { destination } from "src/entity/hotel.entity"

export class HotelDTO{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
    date:Date
    checkInTime:number
}

export class HotelDTO2LCI{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
    lateCheckIn:boolean
}