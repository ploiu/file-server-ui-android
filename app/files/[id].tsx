import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { FileApi } from '@/models';
import { getFileMetadata, getFilePreview } from '@/client/FileClient';
import { ActivityIndicator } from 'react-native-paper';
import FileEntry from '@/app/components/FileEntry';

enum states {
  LOADING,
  SHOWING_DETAILS,
  ERROR,
}

export default function FileView() {
  const { id } = useLocalSearchParams() as { id: string };
  const [file, setFile] = useState<FileApi>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [currentState, setCurrentState] = useState(states.LOADING);
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const parsedId = parseInt(id);
        setFile(await getFileMetadata(parsedId));
        // don't want to hold up the ui thread, so no await here
        getFilePreview(parsedId).then(prev => {
          if (prev) {
            setPreview(prev);
          }
        });
        setCurrentState(states.SHOWING_DETAILS);
      } catch (e) {
        if (typeof e === 'string') {
          console.trace(`Failed to pull file with id ${id}: `, e);
          setErrorMessage(e);
        } else if (e instanceof Error) {
          console.trace(`Failed to pull file with id ${id}: `, e);
          setErrorMessage(e.message);
        }
      }
    })();
  }, [id]);

  const loading = (
    <View>
      <ActivityIndicator size={50} />
    </View>
  );

  const showingDetails = (
    <View style={styles.detailsRoot}>
      <FileEntry file={file!} preview={preview} />
    </View>
  );

  const determineView = () => {
    switch (currentState) {
      case states.LOADING:
        return loading;
      case states.SHOWING_DETAILS:
        return showingDetails;
      case states.ERROR:
        return <></>;
      default:
        return <></>;
    }
  };

  return <View style={styles.root}>{determineView()}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsRoot: {
    flex: 0.9,
  },
});
