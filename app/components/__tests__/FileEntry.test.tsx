import { render, userEvent } from '@testing-library/react-native';
import FileEntry from '@/app/components/FileEntry';
import { FileApi } from '@/models';

describe('icon', () => {
  test('should be visible', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry fileName={file.name} fileType={file.fileType!} />,
    );
    const icon = rendered.getByTestId('fileIcon');
    expect(icon).toBeVisible();
  });

  test('should pass the correct icon type based on the file type', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry fileName={file.name} fileType={file.fileType!} />,
    );
    const icon = rendered.getByTestId('fileIcon');
    expect(icon.props.icon).toBe('file-document');
  });

  test('should be the dimensions passed as props', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        imageWidth={10}
        imageHeight={10}
      />,
    );
    const icon = rendered.getByTestId('fileIcon');
    expect(icon).toHaveStyle({
      width: 10,
      height: 10,
    });
  });

  test('should use the default size if no dimensions are passed', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry fileName={file.name} fileType={file.fileType!} />,
    );
    const icon = rendered.getByTestId('fileIcon');
    expect(icon).toHaveStyle({
      width: 112,
      height: 112,
    });
  });

  test('should not exist if preview is passed', async () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        preview={'aGk='}
      />,
    );
    const icon = rendered.queryAllByTestId('fileIcon');
    expect(icon).toHaveLength(0);
  });
});

describe('preview', () => {
  test('should not exist when no preview is passed', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry fileName={file.name} fileType={file.fileType!} />,
    );
    const preview = rendered.queryAllByTestId('filePreview');
    expect(preview).toHaveLength(0);
  });

  test('should exist when preview is passed', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        preview={'aGk='}
      />,
    );
    const preview = rendered.getByTestId('filePreview');
    expect(preview).toBeVisible();
  });

  test('should be the default size if no size param is passed', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        preview={'aGk='}
      />,
    );
    const preview = rendered.getByTestId('filePreview');
    expect(preview).toHaveStyle({
      width: 112,
      height: 112,
    });
  });

  test('should be the dimensions of the passed width and height variables', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        imageWidth={10}
        imageHeight={10}
        preview={'aGk='}
      />,
    );
    const preview = rendered.getByTestId('filePreview');
    expect(preview).toHaveStyle({
      width: 10,
      height: 10,
    });
  });
});

describe('name', () => {
  test('should show file name', () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const rendered = render(
      <FileEntry fileName={file.name} fileType={file.fileType!} />,
    );
    const name = rendered.getByTestId('fileName');
    expect(name).toHaveTextContent('test.txt', { exact: true });
  });
});

describe('events', () => {
  test('should activate onTap when pressed', async () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const onTap = jest.fn();
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        onTap={onTap}
      />,
    ).getByTestId('root');
    const user = userEvent.setup();
    await user.press(rendered);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('should activate onLongPress when long pressed', async () => {
    const file: FileApi = {
      dateCreated: '',
      fileType: 'Document',
      folderId: 0,
      id: 0,
      name: 'test.txt',
      size: 0,
      tags: [],
    };
    const longPress = jest.fn();
    const rendered = render(
      <FileEntry
        fileName={file.name}
        fileType={file.fileType!}
        onLongPress={longPress}
      />,
    ).getByTestId('root');
    const user = userEvent.setup();
    await user.longPress(rendered);
    expect(longPress).toHaveBeenCalledTimes(1);
  });
});
