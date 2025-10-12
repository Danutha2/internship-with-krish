import { Module } from '@nestjs/common';
import { CheapestrouteController } from './cheapest-route.controller';
import { CheapestrouteService } from './cheapest-route.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [CheapestrouteController],
  providers: [CheapestrouteService]
})
export class CheapestrouteModule {}
