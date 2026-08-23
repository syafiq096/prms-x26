import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MockLink, type MockedResponse } from '@apollo/client/testing';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from './app';
import { SystemStatusDocument } from './generated/graphql';
afterEach(cleanup);
beforeEach(() => localStorage.clear());
function renderApp(path = '/', response?: MockedResponse) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink([
      response ?? {
        request: { query: SystemStatusDocument },
        result: { data: { systemStatus: { state: 'OPERATIONAL' } } },
      },
    ]),
  });
  return render(
    <ApolloProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App client={client} />
      </MemoryRouter>
    </ApolloProvider>,
  );
}
describe('PRMS application shell', () => {
  it('renders an accessible mission-control entry point from mocked GraphQL', async () => {
    const view = renderApp();
    expect(
      screen.getByRole('heading', { name: 'Passenger Resource Management' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('System operational')).toBeInTheDocument();
    expect(
      (
        await axe(view.container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });
  it('guards administrative routes until a Crew Lead identity is selected', async () => {
    renderApp('/admin/passengers');
    expect(
      await screen.findByRole('heading', {
        name: 'Passenger Resource Management',
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Select identity' })[0],
    );
    expect(
      screen.getByRole('dialog', { name: 'Development identity' }),
    ).toBeInTheDocument();
  });
  it('shows GraphQL failures with a retry boundary', async () => {
    renderApp('/', {
      request: { query: SystemStatusDocument },
      error: new Error('Telemetry offline'),
    });
    expect(await screen.findByText('Telemetry offline')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
