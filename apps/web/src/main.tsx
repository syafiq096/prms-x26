import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ClerkProvider } from '@clerk/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { getSessionToken } from './identity';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql',
});
const authLink = setContext(async (_, { headers }) => {
  const token = await getSessionToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App client={apolloClient} />
        </BrowserRouter>
      </ApolloProvider>
    </ClerkProvider>
  </StrictMode>,
);
