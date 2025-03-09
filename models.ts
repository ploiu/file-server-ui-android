// api models
export type Version = {
  version: string;
};

export type DiskInfo = {
  name: string;
  totalSpace: number;
  freeSpace: number;
};

export type CreateFileRequest = {
  file: string;
  extension: string;
  folderId?: number;
};

export type FileApi = {
  id: number;
  folderId?: number;
  name: string;
  tags: TagApi[];
  size?: number;
  dateCreated?: string;
  fileType?: string;
};

export enum FileTypes {
  Application,
  Archive,
  Audio,
  Cad,
  Code,
  Configuration,
  Diagram,
  Document,
  Font,
  Rom,
  Image,
  Material,
  Model,
  Object,
  Presentation,
  SaveFile,
  Spreadsheet,
  Text,
  Video,
}

export type CreateFolderRequest = {
  name: string;
  parentId?: number;
  tags: TagApi[];
};

export type UpdateFolderRequest = {
  id: number;
  name: string;
  parentId?: number;
};

export type UpdatePasswordRequest = {
  oldPassword: CreatePassword;
  newPassword: CreatePassword;
};

export type BasicMessage = {
  message: string;
};

export type FolderApi = {
  id: number;
  parentId?: number;
  path: string;
  name: string;
  folders: FolderApi[];
  files: FileApi[];
  tags: TagApi[];
};

export type TagApi = {
  id?: number;
  title: string;
};

export type CreatePassword = {
  username: string;
  password: string;
};

export type UpdatePassword = {
  oldAuth: CreatePassword;
  newAuth: CreatePassword;
};

// =====================

export function isFolder(item: FolderApi | FileApi): item is FolderApi {
  return "folders" in item;
}

export function isFile(item: FolderApi | FileApi): item is FileApi {
  return !isFolder(item);
}
