import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { isCompatible, passwordCheck } from '@/client/ApiClient';
import { Button, Modal, Portal, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { handleCredentials, saveCredentials } from '@/util/securityHelper';

enum states {
  INITIAL,
  BAD_CREDS,
  INCOMPATIBLE_VERSION,
  // catch-all error
  ERROR,
}

export default function Index() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // hide the password input field contents
  const [hidePassword, setHidePassword] = useState(true);
  const [currentState, setCurrentState] = useState<states>(states.INITIAL);
  const [errorMessage, setErrorMessage] = useState('');

  // @ts-ignore
  const passwordInput = useRef<TextInput>(null);

  useEffect(() => {
    isCompatible().then(async compatible => {
      if (!compatible) {
        setCurrentState(states.INCOMPATIBLE_VERSION);
      } else if (await handleCredentials()) {
        router.navigate('/folders/0');
      }
    });
  }, []);

  const testCreds = async () => {
    try {
      const credsValid = await passwordCheck(username, password);
      if (credsValid) {
        await saveCredentials(username, password);
        globalThis.credentials = btoa(`${username}:${password}`);
        router.navigate('/folders/0');
      } else {
        setCurrentState(states.BAD_CREDS);
      }
    } catch (e) {
      console.trace('Failed to check password', e);
      setCurrentState(states.ERROR);
      setErrorMessage((e as Error)?.message ?? e);
    }
  };

  const inputFields = (
    <>
      <View style={styles.inputWrapper}>
        <TextInput
          mode={'outlined'}
          label={'username'}
          value={username}
          returnKeyType='next'
          onEndEditing={() => passwordInput?.current.focus()}
          error={currentState === states.BAD_CREDS}
          autoCapitalize='none'
          onChangeText={text => setUsername(text)}
        />
        <TextInput
          mode={'outlined'}
          label={'password'}
          autoCapitalize='none'
          secureTextEntry={hidePassword}
          value={password}
          onChangeText={text => setPassword(text)}
          ref={passwordInput}
          error={currentState === states.BAD_CREDS}
          right={
            <TextInput.Icon
              icon='eye'
              onPress={() => setHidePassword(!hidePassword)}
            />
          }
        />
        <Button mode='contained' style={styles.loginButton} onPress={testCreds}>
          Log In
        </Button>
      </View>
    </>
  );

  const incompatibleVersionFields = (
    <Portal>
      <Modal
        visible
        contentContainerStyle={{ padding: 20, backgroundColor: 'white' }}>
        <Text style={{ alignSelf: 'center', color: 'red' }}>
          Invalid Server Version
        </Text>
      </Modal>
    </Portal>
  );

  const getScreenMode = () => {
    switch (currentState) {
      case states.INITIAL:
        return inputFields;
      case states.BAD_CREDS:
        return inputFields;
      case states.INCOMPATIBLE_VERSION:
        return incompatibleVersionFields;
      case states.ERROR:
        return <></>;
    }
  };

  return <View style={styles.root}>{getScreenMode()}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    height: 50,
    padding: 20,
    justifyContent: 'center',
  },
  loginButton: {
    marginTop: 15,
  },
});
