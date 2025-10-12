import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsInfoModule } from './events-info/events-info.module';
import { Event } from './Entity/events.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
          type: 'sqlite',              
          database: 'events.sqlite', 
          entities: [Event],      
          synchronize: true,           
        }),
        EventsInfoModule,
      
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
