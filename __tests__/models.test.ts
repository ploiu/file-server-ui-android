import { isFolder, isFile, FolderApi, FileApi } from '@/models';

describe('isFolder function', () => {
  test('returns true for a folder object', () => {
    // Create a minimal FolderApi object
    const folder: FolderApi = {
      id: 1,
      path: '/test',
      name: 'Test Folder',
      folders: [],
      files: [],
      tags: []
    };
    
    expect(isFolder(folder)).toBe(true);
  });

  test('returns false for a file object', () => {
    // Create a minimal FileApi object
    const file: FileApi = {
      id: 1,
      name: 'test.txt',
      tags: [],
      size: 1024,
      dateCreated: '2025-05-28T00:00:00',
      fileType: 'Text'
    };
    
    expect(isFolder(file)).toBe(false);
  });
});

describe('isFile function', () => {
  test('returns true for a file object', () => {
    // Create a minimal FileApi object
    const file: FileApi = {
      id: 1,
      name: 'test.txt',
      tags: [],
      size: 1024,
      dateCreated: '2025-05-28T00:00:00',
      fileType: 'Text'
    };
    
    expect(isFile(file)).toBe(true);
  });

  test('returns false for a folder object', () => {
    // Create a minimal FolderApi object
    const folder: FolderApi = {
      id: 1,
      path: '/test',
      name: 'Test Folder',
      folders: [],
      files: [],
      tags: []
    };
    
    expect(isFile(folder)).toBe(false);
  });
});
