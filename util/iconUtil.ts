import { Icons } from '@/components/PloiuCon';
import { FileTypes } from '@/models';

export function determineIcon(type?: string): Icons {
  if (!(type ?? 'unknown' in FileTypes)) {
    return 'file-unknown';
  }
  // @ts-ignore enums get compiled down to regular objects, so indexing on a string like this works fine in this case,
  // especially when we check if it's in beforehand
  switch (FileTypes[type!]) {
    case FileTypes.Application:
      return 'file-application';
    case FileTypes.Archive:
      return 'file-archive';
    case FileTypes.Audio:
      return 'file-audio';
    case FileTypes.Cad:
      return 'file-cad';
    case FileTypes.Code:
      return 'file-code';
    case FileTypes.Configuration:
      return 'file-configuration';
    case FileTypes.Diagram:
      return 'file-diagram';
    case FileTypes.Document:
      return 'file-document';
    case FileTypes.Font:
      return 'file-font';
    case FileTypes.Rom:
      return 'file-rom';
    case FileTypes.Image:
      return 'file-image';
    case FileTypes.Material:
      return 'file-material';
    case FileTypes.Model:
      return 'file-model';
    case FileTypes.Object:
      return 'file-object';
    case FileTypes.Presentation:
      return 'file-presentation';
    case FileTypes.SaveFile:
      return 'file-save';
    case FileTypes.Spreadsheet:
      return 'file-spreadsheet';
    case FileTypes.Text:
      return 'file-text';
    case FileTypes.Video:
      return 'file-video';
    default:
      return 'file-unknown';
  }
}
