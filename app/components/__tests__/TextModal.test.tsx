import TextModal from '@/app/components/TextModal';
import { render, userEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

describe('cancel button', () => {
  test('should call the onCancel method', async () => {
    const cancelFn = jest.fn();
    const rendered = render(
      <PaperProvider>
        <TextModal label={'whatever'} onSubmit={() => {}} onCancel={cancelFn} />
      </PaperProvider>,
    );
    const cancelButton = rendered.getByText('Cancel');
    await userEvent.press(cancelButton);
    expect(cancelFn).toHaveBeenCalledTimes(1);
  });
  test('should have the passed cancel text', () => {
    const rendered = render(
      <PaperProvider>
        <TextModal
          label={'whatever'}
          onSubmit={() => {}}
          onCancel={() => {}}
          cancelButtonText={'cancel text'}
        />
      </PaperProvider>,
    );
    const cancelButton = rendered.getByText('cancel text');
    expect(cancelButton).toBeVisible();
  });
});

describe('submit button', () => {
  test('should call the onSubmit function with the filled in value', async () => {
    const submitFn = jest.fn();
    const rendered = render(
      <PaperProvider>
        <TextModal
          label={'whatever'}
          onSubmit={submitFn}
          onCancel={() => {}}
          submitButtonText={'Submit'}
        />
      </PaperProvider>,
    );
    const submitButton = rendered.getByText('Submit');
    await userEvent.press(submitButton);
    expect(submitFn).toHaveBeenCalledTimes(1);
  });
  test('should have the passed submit text', () => {
    const rendered = render(
      <PaperProvider>
        <TextModal
          label={'whatever'}
          onSubmit={() => {}}
          onCancel={() => {}}
          submitButtonText={'some submit text'}
        />
      </PaperProvider>,
    );
    const submitButton = rendered.getByText('some submit text');
    expect(submitButton).toBeVisible();
  });
});

describe('modal', () => {
  test('should submit user-entered text', async () => {
    const submitFn = jest.fn();
    const rendered = render(
      <PaperProvider>
        <TextModal
          label={'whatever'}
          onSubmit={submitFn}
          onCancel={() => {}}
          submitButtonText={'Submit'}
        />
      </PaperProvider>,
    );
    const input = rendered.getByTestId('input');
    const submitButton = rendered.getByText('Submit');
    await userEvent.press(input);
    // we can't trigger an entire re-render when typing into a react-native-paper input field, because it causes issues
    await userEvent.type(input, 'some text idk');
    await userEvent.press(submitButton);
    expect(submitFn).toHaveBeenCalledWith('some text idk');
  });
});
