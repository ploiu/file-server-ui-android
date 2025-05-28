import {
  act,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import FileView from '../[id]';
import { FileApi } from '@/models';
import { getFilePreview } from '@/client/FileClient';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';

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

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('trash state', () => {
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
    await act(async () => {
      fireGestureHandler(gesture, [{ state: State.BEGAN }]);
      jest.advanceTimersByTime(500); // simulate long press delay
      console.error('waiting for now')
      await waitFor(() =>
        expect(rendered.getByTestId('deleteArea')).toBeTruthy(),
      );
      fireGestureHandler(gesture, [
        {
          state: State.ACTIVE,
          translationX: 50,
          translationY: 50,
          duration: 100,
        },
        {
          state: State.ACTIVE,
          translationX: 50,
          translationY: 50,
          duration: 500,
        },
      ]);
      fireGestureHandler(gesture, [
        {
          state: State.END,
        },
      ]);
    });
  });
});
