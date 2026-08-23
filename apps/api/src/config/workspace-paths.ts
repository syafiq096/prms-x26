import { resolve } from 'node:path';

export const workspaceRoot = resolve(__dirname, '../../../..');
export const rootEnvironmentPath = resolve(workspaceRoot, '.env');
