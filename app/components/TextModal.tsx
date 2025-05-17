import { Button, Modal, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/app/_layout';
import { useState } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

export type TextModalProps = {
  label: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  initialValue?: string;
  cancelIcon?: IconSource;
  submitIcon?: IconSource;
  cancelButtonText?: string;
  submitButtonText?: string;
};

export default function TextModal(props: TextModalProps) {
  const submitText = props.submitButtonText ?? 'Submit';
  const cancelText = props.cancelButtonText ?? 'Cancel';

  const [value, setValue] = useState('');

  const submit = () => props.onSubmit(value);
  const cancel = () => props.onCancel();

  return (
    <Modal
      testID={'textModal'}
      visible
      onDismiss={cancel}
      contentContainerStyle={styles.editModal}>
      <TextInput
        testID={'input'}
        placeholder={props.placeholder}
        label={props.label}
        mode={'outlined'}
        value={value}
        onChangeText={setValue}
      />
      <View style={styles.buttonRow}>
        <Button
          testID={'cancelButton'}
          icon={props.cancelIcon}
          mode={'elevated'}
          onPress={cancel}
          style={styles.buttonRowButton}>
          {cancelText}
        </Button>
        <Button
          testID={'submitButton'}
          icon={props.submitIcon}
          mode={'contained'}
          onPress={submit}
          style={styles.buttonRowButton}>
          {submitText}
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  editModal: {
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
