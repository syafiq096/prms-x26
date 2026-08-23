export type MembershipLevel = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  database: 'up' | 'down' | 'not-configured';
}
