import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { Searchv2Controller } from './searchv2.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({
    isGlobal: true,
  }),],
  providers: [SearchService],
  controllers: [SearchController, Searchv2Controller]
})
export class SearchModule { }
