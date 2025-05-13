import { Version } from '../models';
import { apiFetch } from '../Config';

async function getVersion(): Promise<Version> {
  const res = await apiFetch('/api/version');
  return (await res.json()) as Version;
}

export async function isCompatible(): Promise<boolean> {
  const version = await getVersion();
  return globalThis.APP_CONFIG.isCompatible(version.version);
}

/**
 * makes use of the diskInfo endpoint to check if the username and password combination are correct
 * @returns `true` if the username and password combination are correct
 */
export async function passwordCheck(
  username: string,
  password: string,
): Promise<boolean> {
  const res = await apiFetch('/api/disk', {
    headers: {
      authorization: `Basic ${btoa(username + ':' + password)}`,
    },
  });
  return res.status === 200;
}
