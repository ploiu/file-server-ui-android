import {apiFetch} from "@/Config";
import {FolderApi} from "@/models";

export async function getFolderMetadata(id: number): Promise<FolderApi> {
  const response = await apiFetch(`/folders/metadata/${id}`)
  return await response.json() as FolderApi
}
