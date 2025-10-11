import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Flight{

    @PrimaryGeneratedColumn()
    id: number
    @Column()
    from:string
    @Column()
    departTime:Date
    @Column()
    destination:string
    @Column()
    arrivetime:Date
    @Column()
    price:number
    @Column()
    destinationType:destination


}

export enum destination{
    COASTAL='COASTAL',
    INLAND='INLAND'
}