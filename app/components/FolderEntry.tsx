import { FolderApi } from "@/models";
import { Surface, Text, useTheme } from "react-native-paper";
import { Image, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { router } from "expo-router";

type FolderEntryProps = {
  folder: FolderApi;
};

const FolderEntry = (props: FolderEntryProps) => {
  const theme = useTheme();

  const select = () => {
    router.navigate(`/folders/${props.folder.id}`);
  };

  return (
    <TouchableWithoutFeedback onPress={select}>
      <Surface
        elevation={1}
        style={{ ...styles.surface, borderRadius: theme.roundness }}
      >
        <Image source={require("@/assets/images/folder.png")} />
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
