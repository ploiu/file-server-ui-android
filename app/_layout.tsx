import { Stack } from "expo-router";
import React from "react";
import { DefaultTheme, PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider theme={{ ...DefaultTheme, version: 3 }}>
      <Stack screenOptions={{ headerShown: false }}/>
    </PaperProvider>
  );
}
