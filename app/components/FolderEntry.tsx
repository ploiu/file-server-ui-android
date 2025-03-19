import {FolderApi} from "@/models";
import {Surface, Text, useTheme} from "react-native-paper";
import {StyleSheet, TouchableWithoutFeedback, Vibration} from "react-native";
import {router} from "expo-router";
import PloiuCon from "@/app/components/PloiuCon";

type FolderEntryProps = {
  folder: FolderApi;
};

const FolderEntry = (props: FolderEntryProps) => {
  const theme = useTheme();

  const tap = () => {
    router.navigate(`/folders/${props.folder.id}`);
  };

  const pressAndHold = () => {
    Vibration.vibrate(25)
    console.log('pressed and held')
  }

  return (
    <TouchableWithoutFeedback onPress={tap} onLongPress={pressAndHold}>
      <Surface
        elevation={1}
        style={{ ...styles.surface, borderRadius: theme.roundness }}
      >
        <PloiuCon icon={"folder"} style={{ width: 75, height: 75 }} />
        <Text>{props.folder.name}</Text>
      </Surface>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    margin: 8,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

FolderEntry.displayName = "FolderEntry";
export default FolderEntry;
