import {Text, View} from "react-native";
import {useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import {FolderApi} from "@/models";
import {getFolderMetadata} from "@/client/FolderClient";

enum States {
  LOADING,
  LOADED,
  ERROR,
  // TODO maybe these 2 have too much data to show as a modal?
  FOLDER_INFO,
  FILE_INFO
}

export default function FolderView() {
  const [metadata, setMetadata] = useState<FolderApi>()
  const [state, setState] = useState(States.LOADING)
  const {id} = useLocalSearchParams();

  useEffect(() => {
    getFolderMetadata(parseInt(id as string))
      .then(info => {
        setMetadata(info)
        setState(States.LOADED)
      })
      .catch(e => {
        console.trace(e);
        // TODO error modal
        setState(States.ERROR)
      })

  }, [id]);

  return (
    <View>
      <Text>Folder View: {JSON.stringify(metadata)}</Text>
    </View>
  );
}
