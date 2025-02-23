import { Text, View } from "react-native";
import {APP_CONFIG} from "@/Config";
import {useEffect, useState} from "react";
import {isCompatible} from "@/client/ApiClient";

export default function Index() {
  const [compatible, setCompatible] = useState<boolean>()

  useEffect(() => {
    isCompatible()
      .then(res => {
        console.log(res)
        setCompatible(res)
      })
      .catch(console.error)
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text>{JSON.stringify(APP_CONFIG)}</Text>
      <Text>Are we compatible? {String(compatible)}</Text>
    </View>
  );
}
