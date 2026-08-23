import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';

const apolloClient = new ApolloClient({ uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql', cache: new InMemoryCache() });
createRoot(document.getElementById('root')!).render(<StrictMode><ApolloProvider client={apolloClient}><BrowserRouter><App /></BrowserRouter></ApolloProvider></StrictMode>);
