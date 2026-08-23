import { ConfigService } from '@nestjs/config';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengerQueryService } from '../application/passengers/passenger-query.service';
import { DomainError } from '../domain/normalization';
import { ActorContextService } from './actor-context.service';

describe('ActorContextService', () => {
  const crewLeads = { byId: jest.fn() } as unknown as CrewLeadQueryService;
  const passengers = { byId: jest.fn() } as unknown as PassengerQueryService;
  const config = { get: jest.fn().mockReturnValue(true) } as unknown as ConfigService;
  const service = new ActorContextService(crewLeads, passengers, config as never);

  beforeEach(() => jest.clearAllMocks());

  it('resolves an active Crew Lead only through x-actor-id', async () => {
    jest.mocked(crewLeads.byId).mockResolvedValue({ active: true } as never);

    await expect(
      service.crewLead({
        req: { headers: { 'x-actor-id': '00000000-0000-4000-8000-000000000001' } },
      }),
    ).resolves.toEqual({ type: 'CREW_LEAD', id: '00000000-0000-4000-8000-000000000001' });
  });

  it('does not disclose unknown Crew Lead identities', async () => {
    jest.mocked(crewLeads.byId).mockRejectedValue(new DomainError('NOT_FOUND', 'missing'));

    await expect(
      service.crewLead({
        req: { headers: { 'x-actor-id': '00000000-0000-4000-8000-000000000001' } },
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('rejects inactive Passengers as forbidden', async () => {
    jest.mocked(passengers.byId).mockResolvedValue({ active: false } as never);

    await expect(
      service.passenger({
        req: { headers: { 'x-passenger-id': '00000000-0000-4000-8000-000000000002' } },
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
