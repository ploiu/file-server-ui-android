import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from 'expo-secure-store'

export enum BiometricsResult {
  AUTHENTICATE_SUCCESS,
  // either true failure or the user canceled
  AUTHENTICATE_FAILURE,
  // unsupported by the hardware _or_ user hasn't enrolled in using biometrics
  UNSUPPORTED
}

export async function handleBiometrics(promptMessage = 'skip password with biometrics'): Promise<BiometricsResult> {
  const isSupported = await LocalAuthentication.hasHardwareAsync();
  if (!isSupported || !await LocalAuthentication.isEnrolledAsync()) {
    return BiometricsResult.UNSUPPORTED
  }
  const {success} = await LocalAuthentication.authenticateAsync({
    promptMessage,
  })
  return success ? BiometricsResult.AUTHENTICATE_SUCCESS : BiometricsResult.AUTHENTICATE_FAILURE;
}

export async function saveCredentials(username: string, password: string) {
  if (await handleBiometrics('Use biometrics to save password') === BiometricsResult.AUTHENTICATE_SUCCESS) {
    const combinedCreds = btoa(`${username}:${password}`)
    await SecureStore.setItemAsync('credentials', combinedCreds);
    globalThis.credentials = combinedCreds
  }
}

async function areCredentialsStored(): Promise<boolean> {
  return !!(await SecureStore.getItemAsync('credentials'))
}

/**
 * retrieves credentials from the store and saves them to globalThis
 */
async function retrieveCredentials(): Promise<void> {
  const creds = await SecureStore.getItemAsync('credentials')
  if (!creds) {
    throw new Error('Credentials are not stored! Use areCredentialsStored before trying to pull them')
  }
  globalThis.credentials = creds;
}

/**
 * if credentials are stored, prompts for biometric authentication. If that authentication is successful, credentials are stored.
 *
 * @returns `true` if credentials were successfully retrieved from the keystore, `false` otherwise
 */
export async function handleCredentials(): Promise<boolean> {
  const isStored = await areCredentialsStored();
  if (isStored && await handleBiometrics() === BiometricsResult.AUTHENTICATE_SUCCESS) {
    await retrieveCredentials();
    return true;
  }
  return false;
}

