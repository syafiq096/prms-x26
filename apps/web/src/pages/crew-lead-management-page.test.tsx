import { MockedProvider } from '@apollo/client/testing';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CrewLeadManagementDocument } from '../generated/graphql';
import { CrewLeadManagementPage } from './crew-lead-management-page';

vi.mock('../identity', () => ({ useIdentity: () => ({ identity: { id: '10000000-0000-4000-8000-000000000001', role: 'crew-lead', displayName: 'Lead One' } }) }));
afterEach(cleanup);

describe('Crew Lead management page', () => {
  it('shows three active leads, identifies the actor, and allows replacement only for the others', async () => {
    render(<MockedProvider mocks={[{ request: { query: CrewLeadManagementDocument }, result: { data: { activeCrewLeads: [
      { __typename: 'CrewLeadSummary', id: '10000000-0000-4000-8000-000000000001', missionCode: 'LEAD-ONE', fullName: 'Lead One', email: 'one@x26.test', active: true, version: 1 },
      { __typename: 'CrewLeadSummary', id: '10000000-0000-4000-8000-000000000002', missionCode: 'LEAD-TWO', fullName: 'Lead Two', email: null, active: true, version: 1 },
      { __typename: 'CrewLeadSummary', id: '10000000-0000-4000-8000-000000000003', missionCode: 'LEAD-THREE', fullName: 'Lead Three', email: null, active: true, version: 1 },
    ], myCrewLeadProfile: { __typename: 'CrewLead', id: '10000000-0000-4000-8000-000000000001', missionCode: 'LEAD-ONE', fullName: 'Lead One', email: 'one@x26.test', active: true, version: 1 } } } }]}><CrewLeadManagementPage /></MockedProvider>);
    await waitFor(() => expect(screen.getByText('3 of 3 active')).toBeInTheDocument());
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Replace' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Edit profile' })).toHaveLength(1);
  });
});
