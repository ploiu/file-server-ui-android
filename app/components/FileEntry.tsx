import { FileApi } from '../../models';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PloiuCon from '../../app/components/PloiuCon';
import { memo, useEffect, useState } from 'react';
import { determineIcon } from '../../util/iconUtil';

type FileEntryProps = {
  file: FileApi;
  // base64 string
  preview?: string;
  onLongPress?: () => void;
  onTap?: () => void;
};

const FileEntry = memo(
  function FileEntry(props: FileEntryProps) {
    const theme = useTheme();
    const [preview, setPreview] = useState<string>();

    useEffect(() => {
      if (props.preview) {
        setPreview(props.preview);
      } else {
        setPreview(undefined);
      }
    }, [props.preview]);

    return (
      <TouchableWithoutFeedback
        onPress={props.onTap}
        onLongPress={props.onLongPress}>
        <Surface
          elevation={1}
          style={{ ...styles.surface, borderRadius: theme.roundness }}>
          {preview ? (
            <Image
              source={{ uri: `data:image/png;base64,${preview}` }}
              style={styles.image}
            />
          ) : (
            <PloiuCon
              icon={determineIcon(props.file.fileType)}
              style={styles.image}
            />
          )}
          <Text>{props.file.name}</Text>
        </Surface>
      </TouchableWithoutFeedback>
    );
  },
  (previous, next) => previous.preview?.length === next.preview?.length,
);

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    margin: 8,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 112,
    height: 112,
    resizeMode: 'contain',
  },
});

FileEntry.displayName = 'FileEntry';
export default FileEntry;
