export class flightInfo{
    from:string
    departTime:Date
    destination:string
    arrivetime:Date
    price:number
    destinationType:destination

}

export enum destination{
    COASTAL='COASTAL',
    INLAND='INLAND'
}
