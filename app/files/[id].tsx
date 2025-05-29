import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LayoutRectangle, StyleSheet, Vibration, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { FileApi } from '@/models';
import {
  deleteFile,
  downloadFile,
  getFileMetadata,
  getFilePreview,
  updateFile,
} from '@/client/FileClient';
import {
  ActivityIndicator,
  Chip,
  FAB,
  MD3Colors,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import FileEntry from '@/components/FileEntry';
import {
  bytesToShorthand,
  formatFileName,
  getFileExtension,
  getFileSizeAlias,
  stripTimeFromDate,
} from '@/util/misc';
import { documentDirectory, getContentUriAsync } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import TagList from '@/components/TagList';
import Container from '@/components/Container';
import TextModal from '@/components/TextModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from '@react-native-vector-icons/material-design-icons';

export enum States {
  LOADING = 'LOADING',
  SHOWING_DETAILS = 'SHOWING_DETAILS',
}

export enum FabStates {
  /** menu is closed but trash isn't showing */
  CLOSED = 'CLOSED',
  /** regular fab doesn't exist, instead trash fab shows */
  TRASH = 'TRASH',
  /** fab is open */
  OPEN = 'OPEN',
}

export enum ModalStates {
  RENAME = 'RENAME',
  ADD_TAG = 'ADD_TAG',
  DELETE_CONFIRM = 'DELETE_CONFIRM',
  CLOSED = 'CLOSED',
  ERROR = 'ERROR',
}

async function downloadAndOpenFile(file: FileApi) {
  await downloadFile(file, { moveToExternalStorage: false });
  // we downloaded it to the downloads directory, but we don't actually know where that path is. We initially download to the document directory and copy it out though
  const url =
    `${documentDirectory}${file.id}_${formatFileName(file.name)}`.toLowerCase();
  const contentUri = await getContentUriAsync(url);
  // noinspection ES6MissingAwait
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
  // used to change styles when dragging and dropping the file preview
  const [isDraggingFilePreview, setIsDraggingFilePreview] = useState(false);
  const [isHoveringOverTrash, setIsHoveringOverTrash] = useState(false);
  const previewStartEventX = useSharedValue(0);
  const previewStartEventY = useSharedValue(0);
  const previewTranslateX = useSharedValue(0);
  const previewTranslateY = useSharedValue(0);
  // used to tell when the file preview or tag is dragged onto the trash icon
  const [trashLayout, setTrashLayout] = useState<LayoutRectangle>();

  const startDraggingPreview = () => {
    setFabState(FabStates.TRASH);
    Vibration.vibrate(25);
    setIsDraggingFilePreview(true);
  };

  function calculatePreviewIntersectsTrash(yPos: number): boolean {
    if (!trashLayout) {
      return false;
    }
    const minY = trashLayout.y;
    const maxY = trashLayout.y + trashLayout.height;
    // we don't care about x position because the trash View takes up the entire screen width
    return yPos > minY && yPos < maxY;
  }

  const onContinueDraggingPreview = () => {
    setIsHoveringOverTrash(
      calculatePreviewIntersectsTrash(previewTranslateY.value),
    );
  };

  const stopDraggingPreview = () => {
    setFabState(FabStates.CLOSED);
    setIsDraggingFilePreview(false);
    if (calculatePreviewIntersectsTrash(previewTranslateY.value)) {
      setModalState(ModalStates.DELETE_CONFIRM);
    }
  };

  const previewDragHandler = Gesture.Pan()
    .withTestId('previewPan')
    .activateAfterLongPress(250)
    .onBegin(e => {
      previewStartEventX.value = e.x;
      previewStartEventY.value = e.y;
    })
    .onStart(() => runOnJS(startDraggingPreview)())
    .onUpdate(e => {
      previewTranslateX.value =
        e.translationX + previewStartEventX.value - 175 / 2;
      previewTranslateY.value =
        e.translationY + previewStartEventY.value - 175 / 2;
      runOnJS(onContinueDraggingPreview)();
    })
    .onEnd(() => {
      runOnJS(stopDraggingPreview)();
      previewTranslateX.value = withSpring(0);
      previewTranslateY.value = withTiming(0);
    });

  // useFocusEffect doesn't work during tests, so we need to use useEffect during those
  const effect = process.env.NODE_ENV === 'test' ? useEffect : useFocusEffect;
  effect(
    useCallback(() => {
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
    }, [id]),
  );

  const loading = (
    <View testID='loadingSpinner'>
      <ActivityIndicator size={50} />
    </View>
  );

  const submitDelete = () => {
    if (file) {
      setModalState(ModalStates.CLOSED);
      router.replace(`/folders/${file.folderId}`);
      deleteFile(file.id).catch(() => {
        /* ignore errors */
      });
    }
  };

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
            onSubmit={name => {
              if (name.trim().length > 0) {
                submitFile({ name });
              }
            }}
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
            onSubmit={title => {
              if (title.trim().length > 0) {
                submitFile({ tags: [...file.tags, { title }] });
              }
            }}
            onCancel={hideModal}
            submitButtonText={'Add Tag'}
            submitIcon={'tag-plus'}
            cancelIcon={'cancel'}
          />
        );
      case ModalStates.DELETE_CONFIRM:
        return (
          <ConfirmModal
            text={'Are you sure you want to delete this file?'}
            confirmText={'Delete'}
            cancelText={'Cancel'}
            onConfirm={submitDelete}
            onCancel={() => setModalState(ModalStates.CLOSED)}
            cancelIcon={'cancel'}
            confirmIcon={'delete'}
          />
        );
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
          testID: 'openFile',
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
          testID: 'addTag',
          onPress: () => setModalState(ModalStates.ADD_TAG),
        },
        {
          icon: 'delete',
          label: 'Delete',
          onPress: () => setModalState(ModalStates.DELETE_CONFIRM),
        },
      ]
    : [];

  const showingDetails = file ? (
    <View style={styles.detailsRoot}>
      <GestureDetector gesture={previewDragHandler}>
        <Animated.View
          style={[
            styles.fileEntryContainer,
            {
              transform: [
                { translateX: previewTranslateX },
                { translateY: previewTranslateY },
              ],
            },
            isDraggingFilePreview ? { width: 175 } : {},
          ]}>
          <FileEntry
            fileName={file.name}
            fileType={file.fileType}
            preview={preview}
            onTap={() => downloadAndOpenFile(file)}
          />
        </Animated.View>
      </GestureDetector>
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
        onDelete={deleted =>
          submitFile({
            tags: file.tags.filter(it => it.title !== deleted),
          })
        }
      />
      {/*floating menu / delete button*/}
      {fabState === FabStates.TRASH ? (
        <View
          testID={'deleteArea'}
          style={[
            styles.deleteArea,
            { borderRadius: theme.roundness },
            isHoveringOverTrash
              ? {
                  backgroundColor: MD3Colors.error50,
                }
              : {},
          ]}
          onLayout={e => setTrashLayout(e.nativeEvent.layout)}>
          <Text variant={'displayMedium'}>
            <Icon
              name={'delete'}
              size={45}
              color={
                isHoveringOverTrash ? MD3Colors.error20 : MD3Colors.error50
              }
            />{' '}
            Delete
          </Text>
        </View>
      ) : (
        <Portal>
          <FAB.Group
            testID='actionGroup'
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
    elevation: 3,
    zIndex: 3,
    transform: [{ translateX: 0 }, { translateY: 0 }],
  },
  sizeLine: {
    flexDirection: 'row',
  },
  sizeChip: {
    marginLeft: 10,
  },
  deleteArea: {
    borderStyle: 'dashed',
    borderColor: MD3Colors.error60,
    borderWidth: 2,
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
});
