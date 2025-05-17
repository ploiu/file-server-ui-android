import { getFileExtension } from '@/util/misc';
import { FileApi } from '@/models';

test('returns empty string for files without extensions', () => {
  const file: FileApi = {
    id: 0,
    name: 'filename',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('');
});

test('returns the extension with dot for files with extensions', () => {
  const file: FileApi = {
    id: 0,
    name: 'filename.txt',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.txt');
});

test('handles common file extensions correctly', () => {
  const extensions = [
    '.txt',
    '.pdf',
    '.jpg',
    '.png',
    '.docx',
    '.xlsx',
    '.mp3',
    '.mp4',
  ];

  for (const ext of extensions) {
    const file: FileApi = {
      id: 0,
      name: `filename${ext}`,
      tags: [],
    };
    expect(getFileExtension(file)).toBe(ext);
  }
});

test('returns only the last extension for filenames with multiple periods', () => {
  const file: FileApi = {
    id: 0,
    name: 'file.name.with.multiple.periods.txt',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.txt');
});

test('handles filenames that start with a period', () => {
  const file: FileApi = {
    id: 0,
    name: '.test.txt',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.txt');
});

test('handles filenames with only an extension', () => {
  const file: FileApi = {
    id: 0,
    name: '.gitignore',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.gitignore');
});

test('handles uppercase extensions', () => {
  const file: FileApi = {
    id: 0,
    name: 'filename.TXT',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.TXT');
});

test('handles filenames with spaces', () => {
  const file: FileApi = {
    id: 0,
    name: 'file name.txt',
    tags: [],
  };
  expect(getFileExtension(file)).toBe('.txt');
});
