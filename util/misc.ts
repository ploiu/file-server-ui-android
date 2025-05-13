const KIB = 1024
const MIB = KIB * 1024
const GIB = MIB * 1024

/**
 * Converts a raw byte value to a human-readable format.
 * @param bytes - The byte value to format
 * @returns A string representation with appropriate unit (Bytes, KiB, MiB, GiB, or TiB)
 * @example
 * bytesToShorthand(1024) // returns "1KiB"
 * bytesToShorthand(1536) // returns "1.5KiB"
 */
export function bytesToShorthand(bytes: number): string {
  if (bytes < 0) {
    throw new Error('Byte value cannot be negative');
  }

  if (bytes < 1024) {
    return `${bytes} Bytes`;
  }

  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let value = bytes;
  let unitIndex = 0;

  // using a loop like this saves a lot of else/if branches and repeating logic
  while (value >= 1024 && unitIndex < units.length) {
    value /= 1024;
    unitIndex++;
  }

  // Round to 1 decimal place if there's a fractional part
  const formattedValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);

  // Remove trailing zero after decimal point if present
  const cleanedValue = formattedValue.endsWith('.0')
    ? formattedValue.slice(0, -2)
    : formattedValue;

  return `${cleanedValue}${units[unitIndex - 1]}`;
}

/**
 * given an ISO date, returns the part before the `T`
 * @param date
 */
export function stripTimeFromDate(date: string) {
  return date.split('T')[0]
}

/**
 * the backend server changes the file names a bit on the disk, this reverts that formatting for display purposes
 * @param name
 */
export function formatFileName(name: string) {
  return name.replace('leftParenthese', '(').replace('rightParenthese', ')')
}

/**
 * returns the file size alias based on how the server interprets aliases on search
 * @param bytes
 */
export function getFileSizeAlias(bytes: number): 'Tiny' | 'Small' | 'Medium' | 'Large' | 'ExtraLarge' {
  if(bytes < 500 * KIB) {
    return 'Tiny'
  } else if (bytes < 10 * MIB) {
    return 'Small'
  } else if (bytes < 100 * MIB) {
    return 'Medium'
  } else if (bytes < GIB) {
    return 'Large'
  } else {
    return 'ExtraLarge'
  }
}
