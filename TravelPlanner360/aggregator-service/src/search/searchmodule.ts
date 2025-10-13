import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { HttpModule } from '@nestjs/axios';
import { Searchv2Controller } from './searchv2.controller';

@Module({
  imports:[HttpModule],
  providers: [SearchService],
  controllers: [SearchController,Searchv2Controller]
})
export class SearchModule {}
