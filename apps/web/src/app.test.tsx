import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  SignIn: () => <div>Secure sign in</div>,
}));

afterEach(cleanup);

describe('PRMS application shell', () => {
  it('shows the Clerk sign-in boundary when no session exists', () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: new MockLink([]) });
    render(<ApolloProvider client={client}><MemoryRouter><App client={client} /></MemoryRouter></ApolloProvider>);
    expect(screen.getByText('Secure sign in')).toBeInTheDocument();
  });
});
