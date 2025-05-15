import { FlatList, StyleSheet, Vibration, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FileApi, FolderApi, FolderPreviews, isFolder } from '@/models';
import { getFolderMetadata, getFolderPreviews } from '@/client/FolderClient';
import FolderEntry from '@/app/components/FolderEntry';
import FileEntry from '@/app/components/FileEntry';
import { FolderCache, PreviewCache } from '@/util/cacheUtil';

enum States {
  LOADING,
  LOADED,
  ERROR,
  // TODO maybe these 2 have too much data to show as a modal?
  FOLDER_INFO,
  FILE_INFO,
  SELECTING,
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
      const cachedFiles = cached.files.map(f => String(f.name) + f.id);
      const currentFiles = current.files.map(f => String(f.name) + f.id);
      let lengthsDifferent = cachedFiles.length !== currentFiles.length;
      let anyDifferent = false;
      for (const cachedEntry of cachedFiles) {
        if (!currentFiles.includes(cachedEntry)) {
          anyDifferent = true;
          break;
        }
      }
      if (lengthsDifferent || anyDifferent) {
        console.debug('lists do not match! clearing preview cache...');
        // list is different, we need to delete preview cache and re-pull it to make sure we're up-to-date
        await PreviewCache.deleteForFolder(current);
        setPreviews(await getFolderPreviews(current));
        return;
      }
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
        ...info.files.sort((a, b) => a.name.localeCompare(b.name)),
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

  useEffect(() => {
    pullFolderMetadata().then(async folder => {
      if (folder) {
        const previews = await getFolderPreviews(folder);
        setPreviews(previews);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
