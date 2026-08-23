import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApplicationSettingEntity,
  AuditEventEntity,
  CrewLeadEntity,
  PassengerEntity,
  ResourceEntity,
  ResourceUsageEntity,
} from '../database/entities';
import { AuditWriterService } from './audit/audit-writer.service';
import { CrewLeadsService } from './crew-leads/crew-leads.service';
import { CrewLeadQueryService } from './crew-leads/crew-lead-query.service';
import { PassengersService } from './passengers/passengers.service';
import { PassengerQueryService } from './passengers/passenger-query.service';
import { ResourcesService } from './resources/resources.service';
import { ResourceDiscoveryService } from './resources/resource-discovery.service';
import { ResourceQueryService } from './resources/resource-query.service';
import { SystemSetupService } from './system/system-setup.service';
import { SystemStatusQueryService } from './system/system-status-query.service';
import { ResourceUsageService } from './usage/resource-usage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSettingEntity,
      AuditEventEntity,
      CrewLeadEntity,
      PassengerEntity,
      ResourceEntity,
      ResourceUsageEntity,
    ]),
  ],
  providers: [
    AuditWriterService,
    SystemSetupService,
    SystemStatusQueryService,
    CrewLeadsService,
    CrewLeadQueryService,
    PassengersService,
    PassengerQueryService,
    ResourcesService,
    ResourceQueryService,
    ResourceDiscoveryService,
    ResourceUsageService,
  ],
  exports: [
    SystemSetupService,
    SystemStatusQueryService,
    CrewLeadsService,
    CrewLeadQueryService,
    PassengersService,
    PassengerQueryService,
    ResourcesService,
    ResourceQueryService,
    ResourceDiscoveryService,
    ResourceUsageService,
  ],
})
export class PrmsDomainModule {}
