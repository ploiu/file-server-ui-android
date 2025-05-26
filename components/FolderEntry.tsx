import { FolderApi } from '@/models';
import { Text, useTheme } from 'react-native-paper';
import { StyleSheet, TouchableWithoutFeedback, Vibration } from 'react-native';
import { router } from 'expo-router';
import PloiuCon from '@/components/PloiuCon';
import Container from '@/components/Container';

type FolderEntryProps = {
  folder: FolderApi;
};

const FolderEntry = (props: FolderEntryProps) => {
  const theme = useTheme();

  const tap = () => {
    router.navigate(`/folders/${props.folder.id}`);
  };

  const pressAndHold = () => {
    Vibration.vibrate(25);
  };

  return (
    <TouchableWithoutFeedback onPress={tap} onLongPress={pressAndHold}>
      <Container style={{ ...styles.surface, borderRadius: theme.roundness }}>
        <PloiuCon icon={'folder'} style={{ width: 75, height: 75 }} />
        <Text>{props.folder.name}</Text>
      </Container>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

FolderEntry.displayName = 'FolderEntry';
export default FolderEntry;
