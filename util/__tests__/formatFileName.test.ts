import { formatFileName } from '@/util/misc';

test('replaces left and right parentheses', () => {
  const input = 'test leftParenthese1rightParenthese';
  const expected = 'test (1)';
  const actual = formatFileName(input)
  expect(actual).toBe(expected)
});
