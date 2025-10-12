import { Module } from '@nestjs/common';
import { SearchModule } from './search/searchmodule';
import { HttpModule } from '@nestjs/axios';

import { CheapestrouteModule } from './Cheapest-route/cheapest-route.module';
import { ContextualModule } from './Contextual/contextual.module';


@Module({
  imports: [SearchModule,HttpModule, CheapestrouteModule, ContextualModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
