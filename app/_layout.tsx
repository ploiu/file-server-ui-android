import { Stack } from 'expo-router';
import React from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </PaperProvider>
  );
}

// generated from https://callstack.github.io/react-native-paper/docs/guides/theming#creating-dynamic-theme-colors
const theme = {
  ...MD3DarkTheme,
  roundness: 20,
  colors: {
    primary: 'rgb(189, 194, 255)',
    onPrimary: 'rgb(29, 38, 120)',
    primaryContainer: 'rgb(53, 62, 144)',
    onPrimaryContainer: 'rgb(223, 224, 255)',
    secondary: 'rgb(79, 216, 235)',
    onSecondary: 'rgb(0, 54, 61)',
    secondaryContainer: 'rgb(0, 79, 88)',
    onSecondaryContainer: 'rgb(151, 240, 255)',
    tertiary: 'rgb(228, 181, 255)',
    onTertiary: 'rgb(72, 24, 103)',
    tertiaryContainer: 'rgb(96, 49, 127)',
    onTertiaryContainer: 'rgb(244, 218, 255)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    background: 'rgb(27, 27, 31)',
    onBackground: 'rgb(228, 225, 230)',
    surface: 'rgb(27, 27, 31)',
    onSurface: 'rgb(228, 225, 230)',
    surfaceVariant: 'rgb(70, 70, 79)',
    onSurfaceVariant: 'rgb(199, 197, 208)',
    outline: 'rgb(145, 144, 154)',
    outlineVariant: 'rgb(70, 70, 79)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(228, 225, 230)',
    inverseOnSurface: 'rgb(48, 48, 52)',
    inversePrimary: 'rgb(78, 87, 169)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(35, 35, 42)',
      level2: 'rgb(40, 40, 49)',
      level3: 'rgb(45, 45, 56)',
      level4: 'rgb(46, 47, 58)',
      level5: 'rgb(50, 50, 62)',
    },
    surfaceDisabled: 'rgba(228, 225, 230, 0.12)',
    onSurfaceDisabled: 'rgba(228, 225, 230, 0.38)',
    backdrop: 'rgba(48, 48, 56, 0.4)',
  },
};
