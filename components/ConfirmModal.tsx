import { Button, Modal, Text } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/app/_layout';

export type ConfirmModalProps = {
  text: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmIcon?: IconSource;
  cancelIcon?: IconSource;
};

export default function ConfirmModal(props: ConfirmModalProps) {
  return (
    <Modal
      testID={'confirmModal'}
      visible
      onDismiss={props.onCancel}
      contentContainerStyle={styles.modal}>
      <Text variant={'headlineSmall'}>{props.text}</Text>
      <View style={styles.buttonRow}>
        <Button
          testID={'cancelButton'}
          icon={props.cancelIcon}
          mode={'elevated'}
          onPress={props.onCancel}
          style={styles.buttonRowButton}>
          {props.cancelText}
        </Button>
        <Button
          testID={'submitButton'}
          icon={props.confirmIcon}
          mode={'contained'}
          onPress={props.onConfirm}
          style={styles.buttonRowButton}>
          {props.confirmText}
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 10,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: theme.colors.elevation.level4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonRowButton: {
    margin: 10,
    marginTop: 15,
  },
});
