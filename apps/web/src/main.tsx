import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql',
});
const authLink = setContext((_, { headers }) => {
  const stored = localStorage.getItem('prms.identity');
  const identity = stored
    ? (JSON.parse(stored) as { role: 'crew-lead' | 'passenger'; id: string })
    : null;
  return {
    headers: {
      ...headers,
      ...(identity?.role === 'crew-lead' ? { 'x-actor-id': identity.id } : {}),
      ...(identity?.role === 'passenger'
        ? { 'x-passenger-id': identity.id }
        : {}),
    },
  };
});
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App client={apolloClient} />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
