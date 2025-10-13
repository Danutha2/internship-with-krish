import { ColdObservable } from "rxjs/internal/testing/ColdObservable"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Weather{
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    date:Date
    @Column()
    tempMin:number
    @Column()
    tempMax:number
    @Column()
    condition:string
}