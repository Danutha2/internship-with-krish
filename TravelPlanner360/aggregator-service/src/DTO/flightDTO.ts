export class flightInfo{
    from:string
    departTime:string
    destination:string
    arrivetime:string
    price:number
    destinationType:destination

}

export enum destination{
    COASTAL='COASTAL',
    INLAND='INLAND'
}
