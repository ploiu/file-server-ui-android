import { apiFetch } from "@/Config";
import { FolderApi, FolderPreviews } from "@/models";
import { FolderCache, PreviewCache } from "@/util/cacheUtil";

export async function getFolderMetadata(id: number): Promise<FolderApi> {
  const response = await apiFetch(`/folders/metadata/${id}`);
  const folderData = await response.json() as FolderApi;
  // the reason we're storing here but not ever retrieving is that we need to be able to compare for changes for refreshing previews,
  // but changes could happen frequently so we don't ever want stale data - pulling folder metadata is cheap!
  await FolderCache.store(folderData);
  return folderData;
}

// TODO maybe consider proactively pulling the previews for all folders that are direct root folders, as well as the root folder
export async function getFolderPreviews(
  folder: FolderApi,
): Promise<FolderPreviews> {
  const cache = await PreviewCache.getForFolder(folder);
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
  await PreviewCache.storeForFolder(previews);
  return previews;
}
