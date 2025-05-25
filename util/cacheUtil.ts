import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { FileApi, FolderApi, FolderPreviews } from '@/models';

/** list of prefixes used as part of cache keys, to be used by the methods in here to prevent cache collisions */
enum prefixes {
  PREVIEW = '@preview_',
  FOLDER = '@folder_',
}

/**
 * stores the passed value under the passed key in our cache db. non-string values are converted to JSON first before being stored
 *
 * The key is converted to lowercase
 * errors when storing values in the cache are logged but otherwise not returned to the caller.
 * @param key
 * @param value
 */
async function cacheItem(key: string, value: object | string) {
  const actualValue = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    await AsyncStorage.setItem(key.toLowerCase(), actualValue);
  } catch (e) {
    // this is specifically for caching, so we shouldn't interrupt user flow
    console.trace('failed to cache item ' + key, e);
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
    console.trace('failed to retrieve cache value for key ' + key, e);
    return null;
  }
  if (rawValue === null) {
    return null;
  }

  // there are only 2 things that should ever be stored in the cache - strings or actual js objects.
  if (!['{', '['].includes(rawValue[0])) {
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
    console.trace('failed to delete cache value for key ' + key, e);
  }
}

async function deleteMultipleCacheItems(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys.map(it => it.toLowerCase()));
  } catch (e) {
    console.trace('failed to remove multiple caches for keys ' + keys, e);
  }
}

async function getMultipleCacheValues(
  keys: string[],
): Promise<readonly KeyValuePair[]> {
  try {
    return await AsyncStorage.multiGet(keys);
  } catch (e) {
    console.trace('failed to retrieve multiple caches for ' + keys, e);
    return [];
  }
}

// =================================

export class FolderCache {
  static #prefix = prefixes.FOLDER;

  static async store(folder: FolderApi) {
    return cacheItem(this.#prefix + folder.id, folder);
  }

  static async get(id: number): Promise<FolderApi | null> {
    return getCachedItem(this.#prefix + id);
  }

  static async delete(folder: FolderApi): Promise<void> {
    // deleting the cache for a folder means that we should delete the cache for its previews and child folders too
    PreviewCache.deleteForFolder(folder);
    for (const child of folder.folders) {
      this.delete(child);
    }
    return deleteCacheItem(this.#prefix + folder.id);
  }
}

export class PreviewCache {
  static #prefix = prefixes.PREVIEW;

  static async store(id: number, contents: string): Promise<void> {
    return cacheItem(this.#prefix + String(id), contents);
  }

  /**
   * retrieves the preview of the file with the passed id as a base64 string, or `null` if no preview exists
   * @param id
   */
  static async get(id: number): Promise<string | null> {
    return getCachedItem(this.#prefix + id);
  }

  static async getForFolder(folder: FolderApi): Promise<FolderPreviews> {
    const retrieved = await getMultipleCacheValues(
      folder.files.map(file => this.#prefix + String(file.id)),
    );
    const cacheDict = new Map<number, string>();
    for (const [key, value] of retrieved) {
      if (value) {
        cacheDict.set(Number.parseInt(key.replace(this.#prefix, '')), value);
      }
    }
    return cacheDict;
  }

  static async storeForFolder(previews: FolderPreviews): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [key, base64] of previews.entries()) {
      promises.push(this.store(key, base64));
    }

    await Promise.all(promises);
  }

  static async deleteForFolder(folder: FolderApi): Promise<void> {
    return deleteMultipleCacheItems(
      folder.files.map(file => this.#prefix + file.id),
    );
  }

  static async deleteMultiple(files: FileApi[]) {
    // we don't care about waiting for deleting cache entries
    return deleteMultipleCacheItems(files.map(f => this.#prefix + f.id));
  }
}
