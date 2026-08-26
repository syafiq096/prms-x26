import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { gql, useQuery } from '@apollo/client';
import { useAuth, useUser } from '@clerk/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Identity = { role: 'crew-lead' | 'passenger'; id: string; displayName: string };
type IdentityValue = { identity: Identity | null; loading: boolean; linked: boolean; signOut: () => Promise<void> };
const CurrentActorDocument = gql`query CurrentActor { currentActor { id role displayName active } }`;
const IdentityContext = createContext<IdentityValue | null>(null);
let tokenGetter: (() => Promise<string | null>) | null = null;
export function getSessionToken(): Promise<string | null> { return tokenGetter ? tokenGetter() : Promise.resolve(null); }

export function IdentityProvider({ client, children }: { client: ApolloClient<NormalizedCacheObject>; children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useAuth();
  const { isLoaded: userLoaded } = useUser();
  tokenGetter = () => getToken();
  const { data, loading, error } = useQuery(CurrentActorDocument, { skip: !isLoaded || !isSignedIn, fetchPolicy: 'network-only' });
  const identity: Identity | null = data?.currentActor ? 
  { id: data.currentActor.id as string, role: data.currentActor.role === 'CREW_LEAD' ? 'crew-lead' : 
    'passenger', displayName: data.currentActor.displayName as string } :
     null;
  const value = useMemo<IdentityValue>(() => ({ 
    identity, 
    loading: !isLoaded || !userLoaded || (isSignedIn && loading), 
    linked: Boolean(identity), 
    signOut: async () => { await client.clearStore(); await clerkSignOut(); } 
  }), [client, clerkSignOut, identity, isLoaded, isSignedIn, loading, userLoaded]);
  if (error) tokenGetter = () => Promise.resolve(null);
  return  (
  <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
);
}
export function useIdentity() { const value = useContext(IdentityContext); if (!value) throw new Error('IdentityProvider is missing'); return value; }
