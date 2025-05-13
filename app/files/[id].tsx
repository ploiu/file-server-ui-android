import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { FileApi } from '@/models';
import {
  downloadFile,
  getFileMetadata,
  getFilePreview,
} from '@/client/FileClient';
import {
  ActivityIndicator,
  Chip,
  FAB,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import FileEntry from '@/app/components/FileEntry';
import {
  bytesToShorthand,
  formatFileName,
  getFileSizeAlias,
  stripTimeFromDate,
} from '@/util/misc';
import { documentDirectory, getContentUriAsync } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

enum states {
  LOADING,
  SHOWING_DETAILS,
  ERROR,
}

async function downloadAndOpenFile(file: FileApi) {
  await downloadFile(file, { moveToExternalStorage: false });
  // we downloaded it to the downloads directory, but we don't actually know where that path is. We initially download to the document directory and copy it out though
  const url =
    `${documentDirectory}${file.id}_${formatFileName(file.name)}`.toLowerCase();
  const contentUri = await getContentUriAsync(url);
  IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
  });
}

export default function FileView() {
  const theme = useTheme();
  const { id } = useLocalSearchParams() as { id: string };

  const [file, setFile] = useState<FileApi>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      {/*file info*/}
      <Surface
        elevation={2}
        style={{ ...styles.container, borderRadius: theme.roundness }}>
        <Text variant={'headlineSmall'}>Type: {file?.fileType}</Text>
        {/*file size and chip*/}
        <View style={styles.sizeLine}>
          <Text variant={'headlineSmall'}>
            Size: {bytesToShorthand(file?.size ?? 0)}
          </Text>
          <Chip compact={true} icon={'ruler'} style={styles.sizeChip}>
            {getFileSizeAlias(file?.size ?? 0)}
          </Chip>
        </View>
        <Text variant={'headlineSmall'}>
          Date Created: {stripTimeFromDate(file?.dateCreated ?? '')}
        </Text>
      </Surface>
      {/*tags*/}

      {(file?.tags?.length ?? 0 > 0) ? (
        <Surface
          elevation={2}
          style={{
            ...styles.container,
            borderRadius: theme.roundness,
            ...styles.tagContainer,
          }}>
          <FlatList
            numColumns={3}
            columnWrapperStyle={{ marginBottom: 6 }}
            data={file?.tags}
            renderItem={({ item }) => (
              <Chip style={styles.tag} icon={'tag'} testID={item.title}>
                {item.title}
              </Chip>
            )}
          />
        </Surface>
      ) : null}
      <FAB
        icon={'menu'}
        style={{ ...styles.menuButton, borderRadius: theme.roundness }}
        variant={'primary'}
        mode={'flat'}
      />
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
  tagContainer: {},
  tag: {
    marginLeft: 10,
  },
  sizeLine: {
    flexDirection: 'row',
  },
  sizeChip: {
    marginLeft: 10,
  },
  menuButton: {
    position: 'absolute',
    right: 30,
    bottom: 50,
  },
});
