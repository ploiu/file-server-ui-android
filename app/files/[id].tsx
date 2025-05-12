import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { FileApi } from '@/models';
import {
  downloadFile,
  getFileMetadata,
  getFilePreview,
} from '@/client/FileClient';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import FileEntry from '@/app/components/FileEntry';
import { bytesToShorthand } from '@/util/misc';
import { documentDirectory, getContentUriAsync } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

enum states {
  LOADING,
  SHOWING_DETAILS,
  ERROR,
}

async function downloadAndOpenFile(file: FileApi) {
  console.debug(await downloadFile(file, { moveToExternalStorage: false }));
  // we downloaded it to the downloads directory, but we don't actually know where that path is. We initially download to the document directory and copy it out though
  const url = (documentDirectory + file.name).toLowerCase();
  console.debug(url);
  const contentUri = await getContentUriAsync(url);
  console.debug('content uri: ', contentUri);
  IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
  });
  // TODO open
}

export default function FileView() {
  const theme = useTheme();
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
      <View style={styles.fileEntryContainer}>
        <FileEntry
          file={file!}
          preview={preview}
          onTap={() => downloadAndOpenFile(file!)}
        />
      </View>
      <Surface
        elevation={2}
        style={{ ...styles.container, borderRadius: theme.roundness }}>
        <Text variant={'headlineSmall'}>Type: {file?.fileType}</Text>
        <Text variant={'headlineSmall'}>
          Size: {bytesToShorthand(file?.size ?? 0)}
        </Text>
      </Surface>
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
    flex: 1,
  },
  fileEntryContainer: {
    flex: 0.3,
  },
  container: {
    // flex: 1,
    margin: 8,
    paddingBottom: 10,
    paddingTop: 10,
    paddingLeft: 10,
  },
});
