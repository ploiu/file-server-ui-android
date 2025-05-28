import { FileApi } from '@/models';
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
    } as FileApi),
  ),
  getFilePreview: jest.fn(() => Promise.resolve(null)),
}));

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.runOnJS = fn => fn;
  Reanimated.withSpring = value => value;
  Reanimated.withTiming = value => value;
  return Reanimated;
});

describe('trash state', () => {
  test('should show trash view when starting to drag', async () => {
    const actualUseState = React.useState;
    const setStateMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
      const [state, setState] = actualUseState(initial);
      const wrappedSetter = (value: any) => {
        setStateMock(value);
        return setState(typeof value === 'function' ? value(state) : value);
      };
      return [state, wrappedSetter];
    });
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
