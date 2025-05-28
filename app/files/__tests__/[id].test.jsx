import {
  act,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { PaperProvider } from 'react-native-paper';
import FileView, { FabStates } from '../[id]';

jest.mock('@/client/FileClient', () => ({
  getFileMetadata: jest.fn(() =>
    Promise.resolve({
      id: 0,
      dateCreated: '2025-05-01T00:00:00',
      fileType: 'Image',
      name: 'test.txt',
      size: 50 * 1024,
      tags: [{ id: 1, title: 'test tag' }],
      folderId: 0,
    }),
  ),
  getFilePreview: jest.fn(() => Promise.resolve(null)),
}));

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

const actualUseState = React.useState;
const setStateMock = jest.fn();
jest.spyOn(React, 'useState').mockImplementation(initial => {
  const [state, setState] = actualUseState(initial);
  const wrappedSetter = value => {
    setStateMock(value);
    return setState(typeof value === 'function' ? value(state) : value);
  };
  return [state, wrappedSetter];
});

describe('trash state', () => {
  beforeEach(() => globalThis.supressConsoleForAct());
  afterAll(() => globalThis.restoreConsole());
  test('should show trash view when starting to drag', async () => {
    const rendered = render(
      <PaperProvider>
        <GestureHandlerRootView>
          <FileView />
        </GestureHandlerRootView>
      </PaperProvider>,
    );
    await waitForElementToBeRemoved(() =>
      rendered.getByTestId('loadingSpinner'),
    );
    const gesture = getByGestureTestId('previewPan');
    act(() => {
      fireGestureHandler(gesture, []);
      jest.advanceTimersByTime(250);
    });
    expect(setStateMock).toHaveBeenCalledWith(FabStates.TRASH);
  });
});
