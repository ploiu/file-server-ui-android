import { apiFetch } from "@/Config";
import { FolderApi, FolderPreviews } from "@/models";
import { cacheFolderPreviews, getFolderPreviewCache } from "@/util/cacheUtil";

export async function getFolderMetadata(id: number): Promise<FolderApi> {
  const response = await apiFetch(`/folders/metadata/${id}`);
  return await response.json() as FolderApi;
}

// TODO caching layer since this can take several seconds to deliver
//  also maybe consider proactively pulling the previews for all folders that are direct root folders, as well as the root folder
export async function getFolderPreviews(
  folder: FolderApi,
): Promise<FolderPreviews> {
  const cache = await getFolderPreviewCache(folder);
  if (cache.size > 0) {
    return cache;
  }
  const response = await apiFetch(`/folders/preview/${folder.id}`);
  const rawPreviews: Record<string, number[]> = await response.json();
  const previews: FolderPreviews = new Map();
  for (const [id, bytes] of Object.entries(rawPreviews)) {
    previews.set(
      Number.parseInt(id),
      btoa(String.fromCharCode.apply(null, bytes)),
    );
  }
  await cacheFolderPreviews(previews);
  return previews;
}
