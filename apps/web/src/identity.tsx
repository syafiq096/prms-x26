import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
export type Identity = { role: 'crew-lead' | 'passenger'; id: string };
type IdentityValue = {
  identity: Identity | null;
  setIdentity: (value: Identity | null) => Promise<void>;
};
const IdentityContext = createContext<IdentityValue | null>(null);
function readIdentity(): Identity | null {
  try {
    const value = localStorage.getItem('prms.identity');
    return value ? (JSON.parse(value) as Identity) : null;
  } catch {
    return null;
  }
}
export function IdentityProvider({
  client,
  children,
}: {
  client: ApolloClient<NormalizedCacheObject>;
  children: ReactNode;
}) {
  const [identity, update] = useState<Identity | null>(readIdentity);
  const value = useMemo(
    () => ({
      identity,
      setIdentity: async (next: Identity | null) => {
        if (next) localStorage.setItem('prms.identity', JSON.stringify(next));
        else localStorage.removeItem('prms.identity');
        update(next);
        await client.clearStore();
      },
    }),
    [client, identity],
  );
  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}
export function useIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error('IdentityProvider is missing');
  return value;
}
