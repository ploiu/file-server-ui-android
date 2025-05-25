import { FlatList, StyleSheet, Vibration, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FileApi, FolderApi, FolderPreviews, isFolder } from '@/models';
import { getFolderMetadata, getFolderPreviews } from '@/client/FolderClient';
import FolderEntry from '@/app/components/FolderEntry';
import FileEntry from '@/app/components/FileEntry';
import { FolderCache, PreviewCache } from '@/util/cacheUtil';
import { getFilePreview } from '@/client/FileClient';

enum States {
  LOADING,
  LOADED,
  ERROR,
  // TODO maybe these 2 have too much data to show as a modal?
  FOLDER_INFO,
  FILE_INFO,
  SELECTING,
}

export type FileListDelta = {
  deletedFromPrevious: FileApi[];
  addedFromPrevious: FileApi[];
  changedFromPrevious: FileApi[];
};

/**
 * performs a delta on the items in `previous` and `current`, returning an object that has the differences.
 *
 * The point of this delta is for caching preview purposes, so delta rules are a little specialized:
 * - if a file id is in current but not in previous, it's counted in `addedFromPrevious`
 * - if a file id is not in current but is in previous, it's counted in `deletedFromPrevious`
 * - if a file type for an id is different in current but it is included in previous, it's included in `changedFromPrevious`
 *
 * @param previous
 * @param current
 */
export function performFileListDelta(
  previous: FileApi[],
  current: FileApi[],
): FileListDelta {
  // maps are easier to use because it doesn't require us to do int <=> string casting
  const previousIdIndex: Map<number, FileApi> = new Map();
  const currentIdIndex: Map<number, FileApi> = new Map();
  for (const item of previous) {
    previousIdIndex.set(item.id, item);
  }
  for (const item of current) {
    currentIdIndex.set(item.id, item);
  }
  const deletedFromPrevious = previousIdIndex
    .entries()
    .filter(([id]) => !(id in currentIdIndex))
    .map(it => it[1])
    .toArray();
  const addedFromPrevious = currentIdIndex
    .entries()
    .filter(([id]) => !(id in previousIdIndex))
    .map(it => it[1])
    .toArray();
  const changedFromPrevious: FileApi[] = [];
  for (const [id, file] of currentIdIndex) {
    if (previousIdIndex.has(id)) {
      const previous = previousIdIndex.get(id)!;
      if (previous.fileType !== file.fileType) {
        changedFromPrevious.push(file);
      }
    }
  }
  return { deletedFromPrevious, addedFromPrevious, changedFromPrevious };
}

export async function cachePreviewsFromDelta(
  folder: FolderApi,
  delta: FileListDelta,
): Promise<void> {
  console.debug('delta: ', delta);
  const filesToCache = [
    ...delta.addedFromPrevious,
    ...delta.changedFromPrevious,
  ];
  // the server is designed for low-end hardware, so we can't send too many requests at once
  if (filesToCache.length <= 12) {
    const promises: Promise<string | null>[] = [];
    for (const f of filesToCache) {
      promises.push(getFilePreview(f.id));
    }
    await Promise.all(promises);
  } else {
    // too many changes to pull manually, pull the whole folder
    await getFolderPreviews(folder, true);
  }
}

export default function FolderView() {
  const [metadata, setMetadata] = useState<FolderApi>();
  const [state, setState] = useState(States.LOADING);
  const [combined, setCombined] = useState<(FolderApi | FileApi)[]>([]);
  const [previews, setPreviews] = useState<FolderPreviews>(new Map());
  const { id } = useLocalSearchParams();

  const handlePreviews = async (
    cached: FolderApi | null,
    current: FolderApi,
  ) => {
    // if the cached folder is different than the current, that means we need to refresh preview cache
    if (!cached) {
      setPreviews(await getFolderPreviews(current));
    } else {
      const cachedFiles = cached.files;
      const currentFiles = current.files;
      const delta = performFileListDelta(cachedFiles, currentFiles);
      await cachePreviewsFromDelta(current, delta);
      setPreviews(await getFolderPreviews(current));
    }
  };

  const pullFolderMetadata = async () => {
    setState(States.LOADING);
    try {
      const parsedId = parseInt(id as string);
      const cached = await FolderCache.get(parsedId);
      const info = await getFolderMetadata(parsedId);
      setMetadata(info);
      setCombined([
        ...info.folders.sort((a, b) => a.name.localeCompare(b.name)),
        ...info.files.sort((a, b) => b.id - a.id),
      ]);
      setState(States.LOADED);
      // await isn't needed here because it just holds up the return and isn't necessary for immediate rendering
      handlePreviews(cached, info);
      return info;
    } catch (e) {
      console.trace(e);
      // TODO show error screen instead of list
      setState(States.ERROR);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // TODO there will need to be some goofy history management with how deleting files affects history look into usePathname and useSegments
      pullFolderMetadata().then(async folder => {
        if (folder) {
          const previews = await getFolderPreviews(folder);
          setPreviews(previews);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  /** TODO need to think more on how I want to handle this
   * long press for drawer with options? short press for drawer but with big preview?
   *
   * Google photos does full screen preview, but swiping up opens a bottom drawer with information.
   *  - I don't _just_ have photos though
   *  - maybe if no preview, just open the drawer?
   */
  const fileEntry = (item: FileApi): React.ReactElement => {
    const onLongPress = () => {
      Vibration.vibrate(25);
    };
    return (
      <FileEntry
        fileName={item.name}
        fileType={item.fileType!}
        onLongPress={onLongPress}
        preview={previews.get(item.id)}
        onTap={() => router.navigate(`/files/${item.id}`)}
      />
    );
  };

  const folderOrFileEntry = (item: FolderApi | FileApi): React.ReactElement => {
    return isFolder(item) ? <FolderEntry folder={item} /> : fileEntry(item);
  };

  // clear cache and re-pull folder
  const refreshList = async () => {
    if (metadata) {
      await PreviewCache.deleteForFolder(metadata);
      // await not needed here because all the needed processing is in the function
      pullFolderMetadata();
    }
  };

  return (
    <View>
      <FlatList
        style={styles.list}
        data={combined}
        renderItem={({ item }) => folderOrFileEntry(item)}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        onRefresh={refreshList}
        refreshing={state === States.LOADING}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    margin: 5,
  },
});
