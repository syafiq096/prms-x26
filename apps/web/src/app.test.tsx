import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { SystemStatusDocument } from './generated/graphql';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  SignIn: () => <div>Secure sign in</div>,
}));

afterEach(cleanup);

describe('PRMS application shell', () => {
  it('shows the Clerk sign-in boundary when no session exists', () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: new MockLink([{ request: { query: SystemStatusDocument }, result: { data: { systemStatus: { state: 'OPERATIONAL' } } } }]) });
    render(<ApolloProvider client={client}><MemoryRouter><App client={client} /></MemoryRouter></ApolloProvider>);
    return waitFor(() => expect(screen.getByText('Secure sign in')).toBeInTheDocument());
  });

  it('shows public setup instead of Clerk sign-in while uninitialized', async () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: new MockLink([{ request: { query: SystemStatusDocument }, result: { data: { systemStatus: { state: 'UNINITIALIZED' } } } }]) });
    render(<ApolloProvider client={client}><MemoryRouter initialEntries={['/setup']}><App client={client} /></MemoryRouter></ApolloProvider>);
    await waitFor(() => expect(screen.getByText('Initialize mission control')).toBeInTheDocument());
    expect(screen.queryByText('Secure sign in')).not.toBeInTheDocument();
  });
});
