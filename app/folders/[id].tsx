import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function FolderView() {
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text>Folder View: {id}</Text>
        </View>
    );
}
