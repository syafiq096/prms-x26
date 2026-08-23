import { Module } from '@nestjs/common';
import { PrmsDomainModule } from '../application/prms-domain.module';
import { PrmsResolver } from './prms.resolver';
import { ActorContextService } from './actor-context.service';

@Module({
  imports: [PrmsDomainModule],
  providers: [ActorContextService, PrmsResolver],
})
export class PrmsGraphqlModule {}
