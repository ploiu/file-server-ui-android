import { Text, useTheme } from 'react-native-paper';
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PloiuCon from '../../app/components/PloiuCon';
import { memo, useEffect, useState } from 'react';
import { determineIcon } from '@/util/iconUtil';
import { formatFileName } from '@/util/misc';
import Container from '@/app/components/Container';

type FileEntryProps = {
  fileName: string;
  fileType: string;
  // base64 string
  preview?: string;
  imageWidth?: number;
  imageHeight?: number;
  onLongPress?: () => void;
  onTap?: () => void;
};

export default function FileEntry(props: FileEntryProps) {
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

  const ImagePreview = memo(
    (previewProps: { base64: string }) => {
      return (
        <Image
          testID={'filePreview'}
          source={{ uri: `data:image/png;base64,${previewProps.base64}` }}
          style={{
            ...styles.image,
            width: imageWidth,
            height: imageHeight,
          }}
        />
      );
    },
    (previous, next) => previous.base64 === next.base64,
  );
  ImagePreview.displayName = 'ImagePreview';

  return (
    <TouchableWithoutFeedback
      testID={'root'}
      onPress={props.onTap}
      onLongPress={props.onLongPress}>
      <Container style={[styles.surface, { borderRadius: theme.roundness }]}>
        {preview ? (
          <ImagePreview base64={preview} />
        ) : (
          <PloiuCon
            icon={determineIcon(props.fileType)}
            testID={'fileIcon'}
            style={{
              ...styles.image,
              width: imageWidth,
              height: imageHeight,
            }}
          />
        )}
        <Text testID={'fileName'}>{formatFileName(props.fileName)}</Text>
      </Container>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
});
