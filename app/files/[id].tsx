import {useLocalSearchParams} from "expo-router";
import {View} from "react-native";

export default function FileView() {
  const {id} = useLocalSearchParams() as { id: string }

  return <View />
}
