import {BasicMessage, CreateFileRequest, FileApi} from "@/models";
import {apiFetch} from "@/Config";
import * as FileSystem from 'expo-file-system'

export enum DownloadFileResult {
  SUCCESS,
  FAIL,
  PERMISSION_DENIED
}

/**
 * Upload a file to the server
 * @param fileData The file data to upload
 * @param force Whether to force overwrite any file with the same name
 * @returns The uploaded file metadata
 */
export async function uploadFile(fileData: CreateFileRequest, force: boolean = false): Promise<FileApi> {
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
    const errorData = await response.json() as BasicMessage;
    throw new Error(`Failed to upload file: ${errorData.message}`);
  }

  return await response.json() as FileApi;
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
    const errorData = await response.json() as BasicMessage;
    throw new Error(`Failed to update file: ${errorData.message}`);
  }

  return await response.json() as FileApi;
}

// TODO full implementation
export async function searchFiles(search?: string, tags?: string[], attributes?: string[]): Promise<FileApi[]> {
  throw new Error('unimplemented')
}

/**
 * Get file metadata by ID
 * @param id The file ID
 * @returns The file metadata
 */
export async function getFileMetadata(id: number): Promise<FileApi> {
  const response = await apiFetch(`/files/metadata/${id}`);

  if (response.status !== 200) {
    const errorData = await response.json() as BasicMessage;
    throw new Error(`Failed to get file metadata: ${errorData.message}`);
  }

  return await response.json() as FileApi;
}

/**
 * Download a file and save it to the user's Downloads folder
 * @param file The file metadata object
 * @returns Promise<void>
 */
export async function downloadFile(file: FileApi): Promise<DownloadFileResult> {
  /*
    TODO
      1. prompt for permission
      2. prompt for location
      3. check if file already exists
        i. if it does, return state saying file already exists
        ii. if not, go to step 4
      4. call endpoint for download file
      5. check endpoint result
      6. write the file to the document directory
      7. move the file to the location the user selected...find a way to default to the Download folder?
   */
  const permissionCheck = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  console.debug('permission: ', permissionCheck.granted)
  if (!permissionCheck.granted) {
    return DownloadFileResult.PERMISSION_DENIED;
  }

  const downloadResult = await apiFetch(`/files/${file.id}`, {responseType: 'base64'})
  if (downloadResult.status !== 200) {
    const error = await downloadResult.json() as BasicMessage;
    console.trace('Failed to download file ', error.message)
    return DownloadFileResult.FAIL;
  }
  // downloadResult.data will never be undefined here because it's populated when we pass base64 for the response type
  const base64Data = downloadResult.data!;
  console.debug('creating new file at ' + permissionCheck.directoryUri + file.name)
  // knowing the mime type of any arbitrary file is impossible, especially for novel file types. As such, we are using an unrecognized mime type and passing the file extension, even though the docs say not to
  const newUri = await FileSystem.StorageAccessFramework.createFileAsync(permissionCheck.directoryUri, file.name, 'application/unknown')
  console.debug('file created! ', newUri)
  await FileSystem.StorageAccessFramework.writeAsStringAsync(newUri, base64Data, {encoding: 'base64'})
  console.debug('moved to ' + permissionCheck.directoryUri + file.name + '!')
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
    const errorData = await response.json() as BasicMessage;
    throw new Error(`Failed to delete file: ${errorData.message}`);
  }
}

/**
 * Get the path to the app's cache directory for file previews
 * This directory will be cleared when the user clears app storage
 */
export async function getPreviewCacheDirectory(): Promise<string> {
  const cacheDir = `${FileSystem.cacheDirectory}previews`;

  // make sure the directory exists before doing anything with it
  const dirInfo = await FileSystem.getInfoAsync(cacheDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(cacheDir, {intermediates: true});
  }

  return cacheDir;
}


/**
 * Get a file preview by ID
 * @param id The file ID
 * @returns The path to the cached preview image TODO change this to the actual image preview as base64
 */
export async function getFilePreview(id: number): Promise<string> {
  throw new Error('unimplemented!')
  // TODO determine app cache directory and store preview there
}
