import {
  act,
  render,
  userEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import React from 'react';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { PaperProvider } from 'react-native-paper';
import FileView, { FabStates, ModalStates } from '../[id]';
import * as IntentLauncher from 'expo-intent-launcher';
import { downloadFile, updateFile } from '@/client/FileClient';

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
  downloadFile: jest.fn(() => Promise.resolve()),
  updateFile: jest.fn(() => Promise.resolve()),
}));

// copied from expo's own setup.js file because for some reason they don't mock all of their functions
jest.mock('expo-file-system', () => ({
  downloadAsync: jest.fn(() => Promise.resolve({ md5: 'md5', uri: 'uri' })),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, md5: 'md5', uri: 'uri' }),
  ),
  readAsStringAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => Promise.resolve()),
  getContentUriAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock IntentLauncher
jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
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
        <FileView />
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

describe('fab menu', () => {
  beforeEach(() => globalThis.supressConsoleForAct());
  afterAll(() => globalThis.restoreConsole());

  describe('open', () => {
    test('should call downloadFile with moveToExternalStorage: false and attempt to use IntentLauncher', async () => {
      const rendered = render(
        <PaperProvider>
          <FileView />
        </PaperProvider>,
      );

      // Wait for loading spinner to be removed
      await waitForElementToBeRemoved(() =>
        rendered.getByTestId('loadingSpinner'),
      );

      // Find and press the FAB button to open the menu
      const fabButton = rendered.getByTestId('actionGroup');
      await userEvent.press(fabButton);

      // Find and press the Open action
      const openButton = rendered.getByText('Open', {
        includeHiddenElements: true,
      });
      await userEvent.press(openButton);

      // Verify downloadFile was called with the correct parameters
      expect(downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 0,
          name: 'test.txt',
        }),
        { moveToExternalStorage: false },
      );

      // Verify IntentLauncher was called with the correct parameters
      expect(IntentLauncher.startActivityAsync).toHaveBeenCalledWith(
        'android.intent.action.VIEW',
        expect.objectContaining({
          data: expect.any(String),
          flags: 1,
        }),
      );
    });
  });

  describe('save', () => {
    test('should call downloadFile with moveToExternalStorage: true', async () => {
      const rendered = render(
        <PaperProvider>
          <FileView />
        </PaperProvider>,
      );

      // Wait for loading spinner to be removed
      await waitForElementToBeRemoved(() =>
        rendered.getByTestId('loadingSpinner'),
      );

      // Find and press the FAB button to open the menu
      const fabButton = rendered.getByTestId('actionGroup');
      await userEvent.press(fabButton);

      // Find and press the Save action
      const saveButton = rendered.getByText('Save', {
        includeHiddenElements: true,
      });
      await userEvent.press(saveButton);

      // Verify downloadFile was called with the correct parameters
      expect(downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 0,
          name: 'test.txt',
        }),
        { moveToExternalStorage: true },
      );
    });
  });

  describe('rename', () => {
    test('should change modalState to RENAME', async () => {
      const rendered = render(
        <PaperProvider>
          <FileView />
        </PaperProvider>,
      );

      // Wait for loading spinner to be removed
      await waitForElementToBeRemoved(() =>
        rendered.getByTestId('loadingSpinner'),
      );

      // Find and press the FAB button to open the menu
      const fabButton = rendered.getByTestId('actionGroup');
      await userEvent.press(fabButton);

      // Find and press the Rename action
      const renameButton = rendered.getByText('Rename', {
        includeHiddenElements: true,
      });
      await userEvent.press(renameButton);

      // Verify modalState was changed to RENAME
      expect(setStateMock).toHaveBeenCalledWith(ModalStates.RENAME);
    });

    describe('Text modal', () => {
      test('should display a TextModal element with the label of "File Name"', async () => {
        const rendered = render(
          <PaperProvider>
            <FileView />
          </PaperProvider>,
        );

        // Wait for loading spinner to be removed
        await waitForElementToBeRemoved(() =>
          rendered.getByTestId('loadingSpinner'),
        );

        // Find and press the FAB button to open the menu
        const fabButton = rendered.getByTestId('actionGroup');
        await userEvent.press(fabButton);

        // Find and press the Rename action
        const renameButton = rendered.getByText('Rename', {
          includeHiddenElements: true,
        });
        await userEvent.press(renameButton);

        // Verify TextModal is displayed with the correct label
        expect(rendered.getByTestId('input')).toBeVisible();
      });

      test('tapping the "Rename" button should call updateFile with the file, with the name field being updated', async () => {
        const rendered = render(
          <PaperProvider>
            <FileView />
          </PaperProvider>,
        );

        // Wait for loading spinner to be removed
        await waitForElementToBeRemoved(() =>
          rendered.getByTestId('loadingSpinner'),
        );

        // Find and press the FAB button to open the menu
        const fabButton = rendered.getByTestId('actionGroup');
        await userEvent.press(fabButton);

        // Find and press the Rename action
        const renameButton = rendered.getByText('Rename', {
          includeHiddenElements: true,
        });
        await userEvent.press(renameButton);

        // Enter a new file name in the input
        const input = rendered.getByPlaceholderText('test.txt');
        await userEvent.type(input, 'newname.txt');

        // Press the Rename button in the modal
        const modalRenameButton = rendered.getByText('Rename');
        await userEvent.press(modalRenameButton);

        // Verify updateFile was called with the correct parameters
        expect(updateFile).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 0,
            name: 'newname.txt',
          }),
        );

        // Verify modal was closed
        expect(setStateMock).toHaveBeenCalledWith(ModalStates.CLOSED);
      });

      test('tapping the "Rename" button with no value for name should not update the file', async () => {
        const rendered = render(
          <PaperProvider>
            <FileView />
          </PaperProvider>,
        );

        // Wait for loading spinner to be removed
        await waitForElementToBeRemoved(() =>
          rendered.getByTestId('loadingSpinner'),
        );

        // Find and press the FAB button to open the menu
        const fabButton = rendered.getByTestId('actionGroup');
        await userEvent.press(fabButton);

        // Find and press the Rename action
        const renameButton = rendered.getByText('Rename', {
          includeHiddenElements: true,
        });
        await userEvent.press(renameButton);

        // Enter an empty string in the input
        const input = rendered.getByPlaceholderText('test.txt');
        await userEvent.type(input, '');

        // Press the Rename button in the modal
        const modalRenameButton = rendered.getByText('Rename');
        await userEvent.press(modalRenameButton);

        // Verify updateFile was not called
        expect(updateFile).not.toHaveBeenCalled();
      });

      test('tapping the "Rename" button with no file extension should use the file\'s current extension', async () => {
        const rendered = render(
          <PaperProvider>
            <FileView />
          </PaperProvider>,
        );

        // Wait for loading spinner to be removed
        await waitForElementToBeRemoved(() =>
          rendered.getByTestId('loadingSpinner'),
        );

        // Find and press the FAB button to open the menu
        const fabButton = rendered.getByTestId('actionGroup');
        await userEvent.press(fabButton);

        // Find and press the Rename action
        const renameButton = rendered.getByText('Rename', {
          includeHiddenElements: true,
        });
        await userEvent.press(renameButton);

        // Enter a new file name without extension
        const input = rendered.getByPlaceholderText('test.txt');
        await userEvent.type(input, 'newname');

        // Press the Rename button in the modal
        const modalRenameButton = rendered.getByText('Rename');
        await userEvent.press(modalRenameButton);

        // Verify updateFile was called with the correct parameters (should include .txt extension)
        expect(updateFile).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 0,
            name: 'newname.txt',
          }),
        );
      });
    });
  });
});
