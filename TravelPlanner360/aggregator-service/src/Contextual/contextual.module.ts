import { Module } from '@nestjs/common';
import { ContextualService } from './contextual.service';
import { ContextualController } from './contextual.controller';
import { CheapestrouteService } from 'src/Cheapest-route/cheapest-route.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  providers: [ContextualService,CheapestrouteService],
  controllers: [ContextualController]
})
export class ContextualModule {}
