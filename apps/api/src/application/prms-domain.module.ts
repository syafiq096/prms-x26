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
import { PassengersService } from './passengers/passengers.service';
import { ResourcesService } from './resources/resources.service';
import { SystemSetupService } from './system/system-setup.service';
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
    CrewLeadsService,
    PassengersService,
    ResourcesService,
    ResourceUsageService,
  ],
  exports: [
    SystemSetupService,
    CrewLeadsService,
    PassengersService,
    ResourcesService,
    ResourceUsageService,
  ],
})
export class PrmsDomainModule {}
