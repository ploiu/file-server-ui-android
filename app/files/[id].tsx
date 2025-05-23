import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { FileApi } from '@/models';
import {
  downloadFile,
  getFileMetadata,
  getFilePreview,
  updateFile,
} from '@/client/FileClient';
import {
  ActivityIndicator,
  Chip,
  FAB,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import FileEntry from '@/app/components/FileEntry';
import {
  bytesToShorthand,
  formatFileName,
  getFileExtension,
  getFileSizeAlias,
  stripTimeFromDate,
} from '@/util/misc';
import { documentDirectory, getContentUriAsync } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import TagList from '@/app/components/TagList';
import Container from '@/app/components/Container';
import TextModal from '@/app/components/TextModal';

enum States {
  LOADING,
  SHOWING_DETAILS,
}

enum FabStates {
  /** menu is closed but trash isn't showing */
  CLOSED,
  /** regular fab doesn't exist, instead trash fab shows */
  TRASH,
  /** fab is open */
  OPEN,
}

enum ModalStates {
  RENAME,
  ADD_TAG,
  EDIT_TAG,
  DELETE_CONFIRM,
  CLOSED,
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
  const [currentState, setCurrentState] = useState(States.LOADING);
  const [fabState, setFabState] = useState(FabStates.CLOSED);
  const [modalState, setModalState] = useState(ModalStates.CLOSED);
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const parsedId = parseInt(id);
        const f = await getFileMetadata(parsedId);
        setFile(f);
        // don't want to hold up the ui thread, so no await here
        getFilePreview(parsedId).then(prev => {
          if (prev) {
            setPreview(prev);
          }
        });
        setCurrentState(States.SHOWING_DETAILS);
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

  const submitFile = async (changes: Partial<FileApi>) => {
    // file should always exist at this point because the ui elements that trigger this won't exist unless the file does. This is just to appease the typescript compiler
    if (!file) {
      return;
    }
    try {
      // for convenience's sake, we should append the file's original extension if none was passed
      if (changes.name && !/\..+$/.test(changes.name)) {
        changes.name += getFileExtension(file);
      }
      const newFile = await updateFile({ ...file, ...changes });
      setFile(newFile);
      setModalState(ModalStates.CLOSED);
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      } else if (typeof e === 'string') {
        setErrorMessage(e);
      } else {
        setErrorMessage(String(e));
      }
      setModalState(ModalStates.ERROR);
    }
  };

  const hideModal = () => setModalState(ModalStates.CLOSED);

  const renderModalState = () => {
    if (!file) {
      return <></>;
    }
    switch (modalState) {
      case ModalStates.ERROR:
        return <></>;
      case ModalStates.RENAME:
        return (
          <TextModal
            label={'File Name'}
            placeholder={file.name}
            onSubmit={name => submitFile({ name })}
            onCancel={hideModal}
            submitButtonText={'Rename'}
            submitIcon={'pencil'}
            cancelIcon={'cancel'}
          />
        );
      case ModalStates.ADD_TAG:
        return (
          <TextModal
            label={'Tag Name'}
            onSubmit={title => submitFile({ tags: [...file.tags, { title }] })}
            onCancel={hideModal}
            submitButtonText={'Add Tag'}
            submitIcon={'tag-plus'}
            cancelIcon={'cancel'}
          />
        );
      case ModalStates.EDIT_TAG:
        break;
      case ModalStates.DELETE_CONFIRM:
        break;
      case ModalStates.CLOSED:
        return <></>;
    }
  };

  const fabActions = file
    ? [
        {
          icon: 'floppy',
          label: 'Save',
          onPress: () => downloadFile(file, { moveToExternalStorage: true }),
        },
        {
          icon: 'open-in-app',
          label: 'Open',
          onPress: () => downloadAndOpenFile(file),
        },
        {
          icon: 'rename',
          label: 'Rename',
          onPress: () => setModalState(ModalStates.RENAME),
        },
        {
          icon: 'tag-plus',
          label: 'Add Tag',
          onPress: () => setModalState(ModalStates.ADD_TAG),
        },
        {
          icon: 'delete',
          label: 'Delete',
          onPress: () => {},
        },
      ]
    : [];

  const showingDetails = file ? (
    <View style={styles.detailsRoot}>
      <View style={styles.fileEntryContainer}>
        <FileEntry
          fileName={file.name}
          fileType={file.fileType}
          preview={preview}
          onTap={() => downloadAndOpenFile(file)}
        />
      </View>
      {/*file info*/}
      <Container style={{ borderRadius: theme.roundness }}>
        <Text variant={'headlineSmall'}>Type: {file.fileType}</Text>
        {/*file size and chip*/}
        <View style={styles.sizeLine}>
          <Text variant={'headlineSmall'}>
            Size: {bytesToShorthand(file.size)}
          </Text>
          <Chip compact={true} icon={'ruler'} style={styles.sizeChip}>
            {getFileSizeAlias(file.size)}
          </Chip>
        </View>
        <Text variant={'headlineSmall'}>
          Date Created: {stripTimeFromDate(file.dateCreated)}
        </Text>
      </Container>
      {/*tags*/}
      <TagList
        tags={file.tags}
        onAdd={() => setModalState(ModalStates.ADD_TAG)}
      />
      {/*floating menu / delete button*/}
      {fabState === FabStates.TRASH ? (
        <FAB
          testID={'deleteFab'}
          style={{ borderRadius: theme.roundness }}
          variant={'tertiary'}
          icon={'delete'}
        />
      ) : (
        <Portal>
          <FAB.Group
            icon={'menu'}
            onStateChange={({ open }) =>
              setFabState(open ? FabStates.OPEN : FabStates.CLOSED)
            }
            fabStyle={{ borderRadius: theme.roundness }}
            variant={'primary'}
            open={fabState === FabStates.OPEN}
            visible
            actions={fabActions}
          />
        </Portal>
      )}
      {/*different modals*/}
      <Portal>{renderModalState()}</Portal>
    </View>
  ) : null;

  const determineView = () => {
    switch (currentState) {
      case States.LOADING:
        return loading;
      case States.SHOWING_DETAILS:
        return showingDetails;
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
  sizeLine: {
    flexDirection: 'row',
  },
  sizeChip: {
    marginLeft: 10,
  },
});
