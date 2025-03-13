import AsyncStorage from "@react-native-async-storage/async-storage";

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
 * const value: number[] | null = await retrieveCachedItem('test')
 * ```
 * @param key
 */
async function retrieveCachedItem<ReturnType = string>(
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
