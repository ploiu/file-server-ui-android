import { FileApi } from '@/models';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PloiuCon from '../../app/components/PloiuCon';
import { memo, useEffect, useState } from 'react';
import { determineIcon } from '@/util/iconUtil';
import { formatFileName } from '@/util/misc';

type FileEntryProps = {
  file: FileApi;
  // base64 string
  preview?: string;
  imageWidth?: number;
  imageHeight?: number;
  onLongPress?: () => void;
  onTap?: () => void;
};

const FileEntry = memo(
  function FileEntry(props: FileEntryProps) {
    const imageWidth = props.imageWidth ?? 112;
    const imageHeight = props.imageHeight ?? 112;
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
              testID={'filePreview'}
              source={{ uri: `data:image/png;base64,${preview}` }}
              style={{
                ...styles.image,
                width: imageWidth,
                height: imageHeight,
              }}
            />
          ) : (
            <PloiuCon
              icon={determineIcon(props.file.fileType)}
              testID={'fileIcon'}
              style={{
                ...styles.image,
                width: imageWidth,
                height: imageHeight,
              }}
            />
          )}
          <Text testID={'fileName'}>{formatFileName(props.file.name)}</Text>
        </Surface>
      </TouchableWithoutFeedback>
    );
  },
  (previous, next) =>
    previous.preview?.length === next.preview?.length &&
    previous.imageWidth === next.imageWidth &&
    previous.imageHeight === next.imageHeight,
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
    resizeMode: 'contain',
  },
});

FileEntry.displayName = 'FileEntry';
export default FileEntry;
