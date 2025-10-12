export class HotelDTO{
    name:string
    rating:number
    pricePErNight:number
    location:string
    lateCheckIn:boolean
}

export class HotelDTO2LCI{
    name:string
    rating:number
    pricePerNight:number
    location:string
    destinationType:destination
    lateCheckIn:boolean
}

export enum destination {
    COASTAL = 'COASTAL',
    INLAND = 'INLAND'
}

