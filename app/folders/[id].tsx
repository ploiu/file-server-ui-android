import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FileApi, FolderApi, FolderPreviews, isFolder } from "@/models";
import { getFolderMetadata, getFolderPreviews } from "@/client/FolderClient";
import FolderEntry from "@/app/components/FolderEntry";
import FileEntry from "@/app/components/FileEntry";
import {cacheFolderPreviews, clearFolderPreviewCache} from "@/util/cacheUtil";

enum States {
  LOADING,
  LOADED,
  ERROR,
  // TODO maybe these 2 have too much data to show as a modal?
  FOLDER_INFO,
  FILE_INFO,
}

export default function FolderView() {
  const [metadata, setMetadata] = useState<FolderApi>();
  const [state, setState] = useState(States.LOADING);
  const [combined, setCombined] = useState<Array<FolderApi | FileApi>>([]);
  const [previews, setPreviews] = useState<FolderPreviews>(new Map());
  const { id } = useLocalSearchParams();

  const pullFolderMetadata = async () => {
    setState(States.LOADING);
    try {
      const info = await getFolderMetadata(parseInt(id as string));
      setMetadata(info);
      setCombined([
        ...info.folders.sort((a, b) => a.name.localeCompare(b.name)),
        ...info.files.sort((a, b) => a.name.localeCompare(b.name)),
      ]);
      setState(States.LOADED);
      return info
    } catch (e) {
      console.trace(e);
      // TODO show error screen instead of list
      setState(States.ERROR);
    }
  };

  useEffect(() => {
    pullFolderMetadata()
      .then(async folder => {
        if(folder) {
          const previews = await getFolderPreviews(folder)
          setPreviews(previews)
        }
      })
  }, [id]);

  const folderOrFileEntry = (item: FolderApi | FileApi): React.ReactElement => {
    return isFolder(item)
      ? <FolderEntry folder={item} />
      : <FileEntry file={item} preview={previews.get(item.id)} />;
  };

  // clear cache and re-pull folder
  const refreshList = async () => {
    if(metadata) {
      await clearFolderPreviewCache(metadata)
      const folder = await pullFolderMetadata()
      if(folder) {
        const previews = await getFolderPreviews(folder)
        setPreviews(previews)
      }
    }
  }

  return (
    <View>
      <FlatList
        style={styles.list}
        data={combined}
        renderItem={({ item }) => folderOrFileEntry(item)}
        keyExtractor={(item) => String(item.id)}
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
