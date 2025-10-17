import { EventCategory } from "src/DTO/EventDTO";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'date' }) // or 'timestamp' if you want datetime
    date: Date;

    @Column({
        enum: EventCategory
    })

    @Column()
    destination:string
    
    category: EventCategory;
}
