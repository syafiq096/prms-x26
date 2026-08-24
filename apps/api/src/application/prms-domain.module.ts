import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApplicationSettingEntity,
  ActorIdentityEntity,
  AuditEventEntity,
  CrewLeadEntity,
  PassengerEntity,
  ResourceEntity,
  ResourceUsageEntity,
} from '../database/entities';
import { AuditWriterService } from './audit/audit-writer.service';
import { AuditEventQueryService } from './audit/audit-event-query.service';
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
import { ReportingService } from './reporting/reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSettingEntity,
      ActorIdentityEntity,
      AuditEventEntity,
      CrewLeadEntity,
      PassengerEntity,
      ResourceEntity,
      ResourceUsageEntity,
    ]),
  ],
  providers: [
    AuditWriterService,
    AuditEventQueryService,
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
    ReportingService,
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
    AuditEventQueryService,
    ReportingService,
  ],
})
export class PrmsDomainModule {}
