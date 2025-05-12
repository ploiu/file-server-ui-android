// eslint-disable-next-line import/no-unresolved
import rawConfigFile from "@/assets/config.json";

export type ServerConfig = {
  /** ip address and port */
  address: string;
};

interface Config {
  address: string;
  /** compares the server's version against the compatibleVersion string listed above */
  isCompatible: (serverVersion: string) => boolean;
}

function generateCompatibleVersionCheck(version: string): RegExp {
  const formatValidator = /^\d+(\.(\d+|x)){2}$/;
  if (!formatValidator.test(version)) {
    throw new Error(
      `Bad version in config!: ${version} does not follow the format #.(#|x).(#|x) format. e.g. 1.2.x`,
    );
  } else {
    return new RegExp(
      version.split(".").map((it) => it.replace("x", "\\d+")).join("."),
    );
  }
}

function parseServerConfig(input: Record<string, any>): ServerConfig {
  if (!("address" in input) || typeof input.address !== "string") {
    throw new Error(
      `Missing \`address\` field in ${
        JSON.stringify(input)
      }, or \`address\` is not a string`,
    );
  }
  return {
    address: input.address
  };
}

function parseConfig(): Config {
  const { env, compatibleVersion } = rawConfigFile;
  if (env !== "local" && env !== "production") {
    throw new Error(`${env} is not a valid config file environment`);
  }
  if (!(env in rawConfigFile)) {
    throw new Error(
      `env is specified as ${env}, but no config for that env was found in your config file`,
    );
  }
  const versionCheckGex = generateCompatibleVersionCheck(compatibleVersion);
  const serverConfig = parseServerConfig(rawConfigFile[env]);
  return {
    address: serverConfig.address,
    isCompatible: (version) => versionCheckGex.test(version),
  };
}

export const APP_CONFIG = parseConfig();

/** wrapper for ssl pinned fetch that always presents the configured certificate and uses the base url provided in configuration.
 *
 * example usage:
 * ```js
 * fetch('/api/version')
 * ```
 * @param path
 * @param options
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (globalThis.credentials) {
    const headers = options.headers ?? {};
    (headers as Record<string, string>).Authorization = `Basic ${globalThis.credentials}`;
    options.headers = headers;
  }
  const url = `${APP_CONFIG.address}/${path.replace(/^\//, "")}`;
  return fetch(url, options)
}
