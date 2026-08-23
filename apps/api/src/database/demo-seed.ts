import { ConfigService } from '@nestjs/config';
import { config as loadEnvironment } from 'dotenv';
import { validateEnvironment } from '../config/environment';
import { rootEnvironmentPath } from '../config/workspace-paths';
import { AuditWriterService } from '../application/audit/audit-writer.service';
import { PassengersService } from '../application/passengers/passengers.service';
import { ResourcesService } from '../application/resources/resources.service';
import { SystemSetupService } from '../application/system/system-setup.service';
import { MembershipLevel } from '../domain/access-policy';
import {
  CrewLeadEntity,
  PassengerEntity,
  ResourceCategory,
  ResourceEntity,
} from './entities';
import dataSource from './data-source';

loadEnvironment({ path: rootEnvironmentPath });

const demoIds = {
  leads: [
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
  ],
  passengers: [
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000003',
  ],
  resources: [
    '30000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000006',
    '30000000-0000-4000-8000-000000000007',
  ],
} as const;

async function seed(): Promise<void> {
  const environment = validateEnvironment(process.env);
  await dataSource.initialize();
  try {
    const counts = await Promise.all([
      dataSource.getRepository(CrewLeadEntity).count(),
      dataSource.getRepository(PassengerEntity).count(),
      dataSource.getRepository(ResourceEntity).count(),
    ]);
    if (counts.some((count) => count > 0)) {
      throw new Error('Demo seed refuses an environment with business records');
    }

    const audits = new AuditWriterService();
    const setup = new SystemSetupService(
      dataSource,
      new ConfigService(environment),
      audits,
    );
    const passengers = new PassengersService(dataSource, audits);
    const resourcesService = new ResourcesService(dataSource, audits);
    await setup.initialize(environment.PRMS_SETUP_SECRET, [
      {
        id: demoIds.leads[0],
        missionCode: 'AURORA-1',
        fullName: 'Aurora Vega',
        email: 'aurora.vega@example.test',
      },
      {
        id: demoIds.leads[1],
        missionCode: 'BLAZE-2',
        fullName: 'Blaze Orion',
        email: 'blaze.orion@example.test',
      },
      {
        id: demoIds.leads[2],
        missionCode: 'COMET-3',
        fullName: 'Comet Ray',
        email: 'comet.ray@example.test',
      },
    ]);
    const actor = { type: 'CREW_LEAD' as const, id: demoIds.leads[0] };
    await passengers.create(actor, {
      id: demoIds.passengers[0],
      missionCode: 'NOVA-101',
      fullName: 'Nova Hale',
      email: 'nova.hale@example.test',
      cabinCode: 'A-101',
      membershipLevel: MembershipLevel.SILVER,
    });
    await passengers.create(actor, {
      id: demoIds.passengers[1],
      missionCode: 'PULSE-202',
      fullName: 'Pulse Kim',
      email: 'pulse.kim@example.test',
      cabinCode: 'B-202',
      membershipLevel: MembershipLevel.GOLD,
    });
    await passengers.create(actor, {
      id: demoIds.passengers[2],
      missionCode: 'SOLAR-303',
      fullName: 'Solar Imani',
      email: 'solar.imani@example.test',
      cabinCode: 'C-303',
      membershipLevel: MembershipLevel.PLATINUM,
    });
    const resources = [
      [
        'SLEEP-01',
        'Sleep Pods',
        ResourceCategory.SLEEPING,
        MembershipLevel.SILVER,
      ],
      ['FOOD-01', 'Galley', ResourceCategory.FOOD, MembershipLevel.SILVER],
      [
        'OXYGEN-01',
        'Oxygen Station',
        ResourceCategory.OXYGEN,
        MembershipLevel.GOLD,
      ],
      [
        'MEDICAL-01',
        'Medical Bay',
        ResourceCategory.MEDICAL,
        MembershipLevel.GOLD,
      ],
      [
        'HYGIENE-01',
        'Hygiene Suite',
        ResourceCategory.HYGIENE,
        MembershipLevel.SILVER,
      ],
      [
        'FITNESS-01',
        'Fitness Deck',
        ResourceCategory.FITNESS,
        MembershipLevel.PLATINUM,
      ],
      [
        'RECREATION-01',
        'Recreation Lounge',
        ResourceCategory.RECREATION,
        MembershipLevel.GOLD,
      ],
    ] as const;
    for (const [index, resource] of resources.entries()) {
      await resourcesService.create(actor, {
        id: demoIds.resources[index],
        code: resource[0],
        displayName: resource[1],
        category: resource[2],
        minimumMembershipLevel: resource[3],
      });
    }
    await resourcesService.transition(
      actor,
      demoIds.resources[2],
      'OUT_OF_SERVICE',
      'Filter inspection',
    );
    await resourcesService.transition(
      actor,
      demoIds.resources[6],
      'OUT_OF_SERVICE',
      'Retiring lounge equipment',
    );
    await resourcesService.transition(
      actor,
      demoIds.resources[6],
      'DECOMMISSIONED',
      'Equipment retired permanently',
    );
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
