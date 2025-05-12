import { BasicMessage, CreateFileRequest, FileApi } from '@/models';
import { apiFetch, APP_CONFIG } from '@/Config';
import { FileSystem } from 'react-native-file-access';
import { PreviewCache } from '@/util/cacheUtil';
import { documentDirectory, downloadAsync } from 'expo-file-system';

export enum DownloadFileResult {
  SUCCESS,
  API_FAILURE,
  DISK_FAILURE,
}

export type DownloadFileOptions = {
  /** whether to move the file to the downloads folder of the phone */
  moveToExternalStorage: boolean;
};

/**
 * Upload a file to the server
 * @param fileData The file data to upload
 * @param force Whether to force overwrite any file with the same name
 * @returns The uploaded file metadata
 */
export async function uploadFile(
  fileData: CreateFileRequest,
  force: boolean = false,
): Promise<FileApi> {
  const formData = new FormData();
  formData.append('file', fileData.file);
  formData.append('extension', fileData.extension);
  if (fileData.folderId !== undefined) {
    formData.append('folderId', fileData.folderId.toString());
  }

  const url = force ? '/files?force' : '/files';
  const response = await apiFetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status !== 201) {
    const errorData = (await response.json()) as BasicMessage;
    throw new Error(`Failed to upload file: ${errorData.message}`);
  }

  return (await response.json()) as FileApi;
}

/**
 * Update file metadata
 * @param fileData The updated file data
 * @returns The updated file metadata
 */
export async function updateFile(fileData: FileApi): Promise<FileApi> {
  const response = await apiFetch('/files', {
    method: 'PUT',
    body: JSON.stringify(fileData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    const errorData = (await response.json()) as BasicMessage;
    throw new Error(`Failed to update file: ${errorData.message}`);
  }

  return (await response.json()) as FileApi;
}

// TODO full implementation
export async function searchFiles(
  search?: string,
  tags?: string[],
  attributes?: string[],
): Promise<FileApi[]> {
  throw new Error('unimplemented');
}

/**
 * Get file metadata by ID
 * @param id The file ID
 * @returns The file metadata
 */
export async function getFileMetadata(id: number): Promise<FileApi> {
  const response = await apiFetch(`/files/metadata/${id}`);

  if (response.status !== 200) {
    const errorData = (await response.json()) as BasicMessage;
    throw new Error(`Failed to get file metadata: ${errorData.message}`);
  }

  return (await response.json()) as FileApi;
}

/**
 * given the passed `fileUri`, attempts to save the file located at that uri to the album for the file server
 * @param fileUri the `file://` uri to be saved to the album
 * @param file
 */
async function moveToExternalStorage(
  fileUri: string,
  file: FileApi,
): Promise<boolean> {
  try {
    await FileSystem.cpExternal(fileUri, file.name, 'downloads');
  } catch (e) {
    console.trace('failed to move file to external storage', String(e));
    return false;
  }
  return true;
}

/**
 * Download a file and save it to the user's Downloads folder
 * @param file The file metadata object
 * @param options
 * @returns Promise<void>
 */
export async function downloadFile(
  file: FileApi,
  options: DownloadFileOptions,
): Promise<DownloadFileResult> {
  // initially store the file in the cache directory
  const downloadResult = await downloadAsync(
    `${APP_CONFIG.address}/files/${file.id}`,
    documentDirectory + file.name.toLowerCase(),
    {
      headers: {
        Authorization: `Basic ${globalThis.credentials}`,
      },
    },
  );
  if (downloadResult.status !== 200) {
    console.trace('Failed to download file. Check server logs for details');
    return DownloadFileResult.API_FAILURE;
  }
  try {
    if (options.moveToExternalStorage) {
      await moveToExternalStorage(downloadResult.uri, file);
    }
  } catch (e) {
    console.trace(
      'Failed to write file to disk or move file to external downloads folder: ',
      String(e),
    );
  }
  return DownloadFileResult.SUCCESS;
}

/**
 * Delete a file by ID
 * @param id The file ID TODO delete file preview cache
 */
export async function deleteFile(id: number): Promise<void> {
  const response = await apiFetch(`/files/${id}`, {
    method: 'DELETE',
  });

  if (response.status !== 204) {
    const errorData = (await response.json()) as BasicMessage;
    throw new Error(`Failed to delete file: ${errorData.message}`);
  }
}

/**
 * Get a file preview by ID
 * @returns The contents of the preview as base64
 * @param id
 */
export async function getFilePreview(id: number): Promise<string | null> {
  const cached = await PreviewCache.get(id);
  if (!cached) {
    const fetchedCache = await apiFetch(`/files/preview/${id}`);
    // we don't want to throw an error if 404, just return null
    if (fetchedCache.status === 404) {
      return null;
    } else if (fetchedCache.status !== 200) {
      const { message } = (await fetchedCache.json()) as BasicMessage;
      throw new Error('Failed to download preview cache for file: ' + message);
    }
    const data = await fetchedCache.bytes();
    // memory constraints shouldn't be an issue here since the previews are all about 32kb in size
    let base64 = btoa(String.fromCharCode.apply(null, [...data]));
    PreviewCache.store(id, base64);
    // we don't care about waiting on writing to the cache, so no await here
    return base64;
  } else {
    return PreviewCache.get(id);
  }
}
