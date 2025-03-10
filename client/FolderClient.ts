import {apiFetch} from "@/Config";
import {FolderApi, FolderPreviews} from "@/models";

export async function getFolderMetadata(id: number): Promise<FolderApi> {
  const response = await apiFetch(`/folders/metadata/${id}`)
  return await response.json() as FolderApi
}

// TODO caching layer since this can take several seconds to deliver
//  also maybe consider proactively pulling the previews for all folders that are direct root folders, as well as the root folder
export async function getFolderPreviews(folderId: number): Promise<FolderPreviews> {
  const response = await apiFetch(`/folders/preview/${folderId}`)
  return await response.json();
}
