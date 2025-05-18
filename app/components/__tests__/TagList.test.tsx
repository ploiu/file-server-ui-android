import type { TagApi } from '@/models';
import { render, userEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import TagList from '@/app/components/TagList';

describe('tags', () => {
  test('should show list of tags', () => {
    const tags: TagApi[] = [
      {
        id: 1,
        title: 'test',
      },
      {
        id: 2,
        title: 'test2',
      },
    ];
    const rendered = render(
      <PaperProvider>
        <TagList tags={tags} onAdd={() => {}} />
      </PaperProvider>,
    );
    for (const tag of tags) {
      const tagElement = rendered.getByText(tag.title);
      expect(tagElement).toBeVisible();
    }
  });
});

describe('add button', () => {
  test('should show add button', () => {
    const rendered = render(
      <PaperProvider>
        <TagList tags={[]} onAdd={() => {}} />
      </PaperProvider>,
    );
    const button = rendered.getByText('Add Tag');
    expect(button).toBeVisible();
  });
  test('clicking add button should trigger onClick', async () => {
    const onAdd = jest.fn();
    const rendered = render(
      <PaperProvider>
        <TagList tags={[]} onAdd={onAdd} />
      </PaperProvider>,
    );
    const button = rendered.getByText('Add Tag');
    await userEvent.press(button);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
