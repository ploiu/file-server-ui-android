import {Version} from "@/models";
import {apiFetch, APP_CONFIG} from "@/Config";

async function getVersion(): Promise<Version> {
  const res = await apiFetch('/api/version')
  return await res.json() as Version;
}

export async function isCompatible(): Promise<boolean> {
  const config = APP_CONFIG;
  const version = await getVersion()
  return APP_CONFIG.isCompatible(version.version)
}
