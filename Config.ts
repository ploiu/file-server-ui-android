import rawConfigFile from "@/assets/config.json";
import {fetch as sslFetch, ReactNativeSSLPinning,} from "react-native-ssl-pinning";

export type ServerConfig = {
  /** ip address and port */
  address: string;
  /** name of your certificate (without extension), should be placed in android/app/src/main/assets. Should be in der format */
  certificateName: string;
};

interface Config {
  address: string;
  certificateName: string;
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
  if (
    !("certificateName" in input) || typeof input.certificateName !== "string"
  ) {
    throw new Error(
      `Missing \`certificateName\` field in ${
        JSON.stringify(input)
      }, or \`certificateName\` is not a string`,
    );
  }
  return {
    address: input.address,
    certificateName: input.certificateName,
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
    certificateName: serverConfig.certificateName,
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
  options?: Omit<ReactNativeSSLPinning.Options, "sslPinning">,
): Promise<ReactNativeSSLPinning.Response> {
  const certOptions = {
    sslPinning: {
      certs: [APP_CONFIG.certificateName],
    },
  };
  const fetchOptions: ReactNativeSSLPinning.Options = {
    ...options,
    ...certOptions,
  };
  if (globalThis.credentials) {
    const headers = fetchOptions.headers ?? {};
    headers.Authorization = `Basic ${globalThis.credentials}`
    fetchOptions.headers = headers;
  }
  const url = `${APP_CONFIG.address}/${path.replace(/^\//, "")}`;
  try {
    return await sslFetch(url, fetchOptions);
  } catch (e) {
    return e as ReactNativeSSLPinning.Response;
  }
}
