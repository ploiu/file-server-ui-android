import { stripTimeFromDate } from '@/util/misc';

test('should return the part before the T', () => {
  const input = '2025-05-12T20:36:00';
  const expected = '2025-05-12';
  const actual = stripTimeFromDate(input);
  expect(actual).toBe(expected);
});

test('should return the first part if there is no T', () => {
  const input = '2025-05-12';
  const expected = input;
  const actual = stripTimeFromDate(input);
  expect(actual).toBe(expected);
});
