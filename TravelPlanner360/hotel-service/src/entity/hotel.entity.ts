import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Hotel {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column()
    rating: number
    @Column()
    pricePerNight: number
    @Column()
    location: string
    @Column()
    destinationType: destination
    @Column({ type: 'boolean' })
    lateCheckIn: boolean;
    @Column()
    date:Date
    @Column()
    checkInTime:number
}

export enum destination {
    COASTAL = 'COASTAL',
    INLAND = 'INLAND'
}