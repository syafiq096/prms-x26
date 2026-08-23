import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('PRMS application shell', () => {
  it('renders the mission-control entry point', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Passenger Resource Management' }),
    ).toBeInTheDocument();
  });
});
