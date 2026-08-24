import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CrewLeadQueryService } from '../application/crew-leads/crew-lead-query.service';
import { PassengerQueryService } from '../application/passengers/passenger-query.service';
import { ActorContextService } from './actor-context.service';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
  createClerkClient: jest.fn(),
}));

const verifiedUser = (emailAddress: string) => ({
  primaryEmailAddressId: 'email-id',
  emailAddresses: [
    {
      id: 'email-id',
      emailAddress,
      verification: { status: 'verified' },
    },
  ],
});
const repositoryWith = (records: unknown[]) => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(records),
  }),
});

describe('ActorContextService', () => {
  const crewLeads = { byId: jest.fn() } as unknown as CrewLeadQueryService;
  const passengers = { byId: jest.fn() } as unknown as PassengerQueryService;
  const config = { get: jest.fn().mockReturnValue('sk_test_fixture') } as unknown as ConfigService;

  beforeEach(() => jest.clearAllMocks());

  it('accepts an already verified Crew Lead actor', async () => {
    const service = new ActorContextService(crewLeads, passengers, {} as DataSource, config as never);
    await expect(service.crewLead({ actor: { type: 'CREW_LEAD', id: 'lead-id' } })).resolves.toEqual({ type: 'CREW_LEAD', id: 'lead-id' });
  });

  it('rejects a Passenger from a Crew Lead operation', async () => {
    const service = new ActorContextService(crewLeads, passengers, {} as DataSource, config as never);
    await expect(service.crewLead({ actor: { type: 'PASSENGER', id: 'passenger-id' } })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects legacy actor headers when no session is present', async () => {
    const service = new ActorContextService(crewLeads, passengers, {} as DataSource, config as never);
    await expect(service.passenger({ req: { headers: { 'x-passenger-id': 'ignored' } } })).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('automatically links exactly one active Crew Lead with the verified Clerk email', async () => {
    const identityRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockImplementation(async (value) => value),
    };
    const dataSource = {
      getRepository: jest
        .fn()
        .mockReturnValueOnce(repositoryWith([{ id: 'lead-id' }]))
        .mockReturnValueOnce(repositoryWith([]))
        .mockReturnValueOnce(identityRepository),
    } as unknown as DataSource;
    jest.mocked(createClerkClient).mockReturnValue({ users: { getUser: jest.fn().mockResolvedValue(verifiedUser('crew@example.test')) } } as never);
    const service = new ActorContextService(crewLeads, passengers, dataSource, config as never);

    await expect((service as unknown as { linkByVerifiedEmail: (subject: string) => Promise<unknown> }).linkByVerifiedEmail('user_123')).resolves.toMatchObject({ clerkSubject: 'user_123', crewLeadId: 'lead-id' });
  });

  it('does not link an unmatched verified email', async () => {
    const dataSource = { getRepository: jest.fn().mockReturnValueOnce(repositoryWith([])).mockReturnValueOnce(repositoryWith([])) } as unknown as DataSource;
    jest.mocked(createClerkClient).mockReturnValue({ users: { getUser: jest.fn().mockResolvedValue(verifiedUser('nobody@example.test')) } } as never);
    const service = new ActorContextService(crewLeads, passengers, dataSource, config as never);

    await expect((service as unknown as { linkByVerifiedEmail: (subject: string) => Promise<unknown> }).linkByVerifiedEmail('user_123')).resolves.toBeNull();
  });

  it('automatically links exactly one active Passenger with the verified Clerk email', async () => {
    const identityRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockImplementation(async (value) => value),
    };
    const dataSource = {
      getRepository: jest
        .fn()
        .mockReturnValueOnce(repositoryWith([]))
        .mockReturnValueOnce(repositoryWith([{ id: 'passenger-id' }]))
        .mockReturnValueOnce(identityRepository),
    } as unknown as DataSource;
    jest.mocked(createClerkClient).mockReturnValue({ users: { getUser: jest.fn().mockResolvedValue(verifiedUser('passenger@example.test')) } } as never);
    const service = new ActorContextService(crewLeads, passengers, dataSource, config as never);

    await expect((service as unknown as { linkByVerifiedEmail: (subject: string) => Promise<unknown> }).linkByVerifiedEmail('user_123')).resolves.toMatchObject({ clerkSubject: 'user_123', passengerId: 'passenger-id' });
  });

  it('does not link an email that matches more than one active actor', async () => {
    const dataSource = {
      getRepository: jest
        .fn()
        .mockReturnValueOnce(repositoryWith([{ id: 'lead-id' }]))
        .mockReturnValueOnce(repositoryWith([{ id: 'passenger-id' }])),
    } as unknown as DataSource;
    jest.mocked(createClerkClient).mockReturnValue({ users: { getUser: jest.fn().mockResolvedValue(verifiedUser('shared@example.test')) } } as never);
    const service = new ActorContextService(crewLeads, passengers, dataSource, config as never);

    await expect((service as unknown as { linkByVerifiedEmail: (subject: string) => Promise<unknown> }).linkByVerifiedEmail('user_123')).resolves.toBeNull();
  });
});
