import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, SurfaceProps } from 'react-native-paper';

export default function Container(props: PropsWithChildren & SurfaceProps) {
  props.elevation = props.elevation ?? 1;
  return (
    <Surface {...props} style={[styles.container, props.style]}>
      {props.children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 10,
  },
});
