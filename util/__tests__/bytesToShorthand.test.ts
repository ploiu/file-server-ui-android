import { bytesToShorthand } from '@/util/misc';

test('handles byte values less than 1024', () => {
  expect(bytesToShorthand(0)).toBe('0 Bytes');
  expect(bytesToShorthand(1)).toBe('1 Bytes');
  expect(bytesToShorthand(512)).toBe('512 Bytes');
  expect(bytesToShorthand(1023)).toBe('1023 Bytes');
});

test('handles KiB values correctly', () => {
  expect(bytesToShorthand(1024)).toBe('1KiB');
  expect(bytesToShorthand(1536)).toBe('1.5KiB');
  expect(bytesToShorthand(2048)).toBe('2KiB');
});

test('handles MiB values correctly', () => {
  expect(bytesToShorthand(1048576)).toBe('1MiB'); // 1024^2
  expect(bytesToShorthand(1572864)).toBe('1.5MiB'); // 1.5 * 1024^2
});

test('handles GiB values correctly', () => {
  expect(bytesToShorthand(1073741824)).toBe('1GiB'); // 1024^3
  expect(bytesToShorthand(1610612736)).toBe('1.5GiB'); // 1.5 * 1024^3
});

test('handles TiB values correctly', () => {
  expect(bytesToShorthand(1099511627776)).toBe('1TiB'); // 1024^4
  expect(bytesToShorthand(1649267441664)).toBe('1.5TiB'); // 1.5 * 1024^4
});

test('handles values that would exceed TiB', () => {
  expect(bytesToShorthand(1125899906842624)).toBe('1024TiB'); // 1024^5
});

test('throws error for negative values', () => {
  expect(() => bytesToShorthand(-1)).toThrow('Byte value cannot be negative');
});

test('removes trailing zeros in decimal places', () => {
  // 1024 + 102.4 = 1126.4 bytes = 1.1 KiB
  expect(bytesToShorthand(1126)).toBe('1.1KiB');

  // 1024 + 204.8 = 1228.8 bytes = 1.2 KiB
  expect(bytesToShorthand(1229)).toBe('1.2KiB');

  // Exactly 2048 bytes = 2.0 KiB, but should display as "2KiB"
  expect(bytesToShorthand(2048)).toBe('2KiB');
});
