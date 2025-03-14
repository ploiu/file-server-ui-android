import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyValuePair } from "@react-native-async-storage/async-storage/lib/typescript/types";
import { FolderApi, FolderPreviews } from "@/models";

/**
 * stores the passed value under the passed key in our cache db. non-string values are converted to JSON first before being stored
 *
 * The key is converted to lowercase
 * errors when storing values in the cache are logged but otherwise not returned to the caller.
 * @param key
 * @param value
 */
async function cacheItem(key: string, value: Object | string) {
  const actualValue = typeof value === "string" ? value : JSON.stringify(value);
  try {
    await AsyncStorage.setItem(key.toLowerCase(), actualValue);
  } catch (e) {
    // this is specifically for caching, so we shouldn't interrupt user flow
    console.trace("failed to cache item " + key, e);
  }
}

/**
 * retrieves the item cached under the passed key.
 *
 * key is converted to lower case before being used to pull the value.
 * default value is string, but changing the value of the declared variable changes the values of this function.
 *
 * example string value:
 * ```ts
 * const value = await retrieveCachedItem('test') // string | null
 * ```
 *
 * example with an object value
 * ```ts
 * const value = await retrieveCachedItem<number[]>('test') // number[] | null
 * ```
 * @param key
 */
async function getCachedItem<ReturnType = string>(
  key: string,
): Promise<ReturnType | null> {
  let rawValue: string | null;
  try {
    rawValue = await AsyncStorage.getItem(key.toLowerCase());
  } catch (e) {
    console.trace("failed to retrieve cache value for key " + key, e);
    return null;
  }
  if (rawValue === null) {
    return null;
  }

  // there are only 2 things that should ever be stored in the cache - strings or actual js objects.
  if (!["{", "["].includes(rawValue[0])) {
    return rawValue as ReturnType;
  } else {
    return JSON.parse(rawValue);
  }
}

/**
 * deletes the value associated with the passed cache key.
 *
 * the key is converted to lowercase before being used
 * @param key
 */
async function deleteCacheItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key.toLowerCase());
  } catch (e) {
    console.trace("failed to delete cache value for key " + key, e);
  }
}

async function deleteMultipleCacheItems(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys.map((it) => it.toLowerCase()));
  } catch (e) {
    console.trace("failed to remove multiple caches for keys " + keys, e);
  }
}

async function getMultipleCacheValues(
  keys: string[],
): Promise<readonly KeyValuePair[]> {
  try {
    return await AsyncStorage.multiGet(keys);
  } catch (e) {
    console.trace("failed to retrieve multiple caches for " + keys, e);
    return [];
  }
}

export function cacheImage(id: number, contents: string): Promise<void> {
  return cacheItem(String(id), contents);
}

export function getCachedImage(id: number): Promise<string | null> {
  return getCachedItem(String(id));
}

export async function getFolderPreviewCache(
  folder: FolderApi,
): Promise<FolderPreviews> {
  const retrieved = await getMultipleCacheValues(
    folder.files.map((file) => String(file.id)),
  );
  const cacheDict = new Map<number, string>();
  for (const [key, value] of retrieved) {
    if (value) {
      cacheDict.set(Number.parseInt(key), value);
    }
  }
  return cacheDict;
}

export async function clearFolderPreviewCache(
  folder: FolderApi,
): Promise<void> {
  return deleteMultipleCacheItems(folder.files.map((file) => String(file.id)));
}

export async function cacheFolderPreviews(
  previews: FolderPreviews,
): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const [key, base64] of previews.entries()) {
    promises.push(cacheImage(key, base64));
  }

  return Promise.all(promises).then();
}
