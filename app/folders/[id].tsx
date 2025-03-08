import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FolderApi } from "@/models";
import { getFolderMetadata } from "@/client/FolderClient";
import FolderEntry from "@/app/components/FolderEntry";

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
  const { id } = useLocalSearchParams();

  const pullFolderMetadata = async () => {
    setState(States.LOADING);
    try {
      const info = await getFolderMetadata(parseInt(id as string));
      setMetadata(info);
      setState(States.LOADED);
    } catch (e) {
      console.trace(e);
      // TODO show error screen instead of list
      setState(States.ERROR);
    }
  };

  useEffect(() => {
    pullFolderMetadata();
  }, [id]);

  return (
    <View>
      <FlatList
        style={styles.list}
        data={metadata?.folders}
        renderItem={({ item }) => <FolderEntry folder={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        onRefresh={pullFolderMetadata}
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
