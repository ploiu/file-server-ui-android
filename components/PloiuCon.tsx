// it's a pun...get it? Ploiu Icon => PloiuCon
// ...ok it's bad, but it flows better

import { Image, ImageRequireSource } from 'react-native';
import * as React from 'react';
import { ImageProps } from 'react-native/Libraries/Image/Image';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AVAILABLE_ICONS = [
  'file-application',
  'file-archive',
  'file-audio',
  'file-cad',
  'file-code',
  'file-configuration',
  'file-diagram',
  'file-document',
  'file-unknown',
  'folder',
  'file-font',
  'file-image',
  'file-material',
  'file-message',
  'file-model',
  'file-object',
  'plus',
  'file-presentation',
  'file-rom',
  'file-save',
  'file-spreadsheet',
  'file-text',
  'file-video',
] as const;

export type Icons = (typeof AVAILABLE_ICONS)[number];
export type PloiuConProps = Omit<ImageProps, 'source'> & {
  icon: Icons;
};

const icons: Record<Icons, ImageRequireSource> = {
  'file-application': require('@/assets/images/application.png'),
  'file-archive': require('@/assets/images/archive.png'),
  'file-audio': require('@/assets/images/audio.png'),
  'file-cad': require('@/assets/images/cad.png'),
  'file-code': require('@/assets/images/code.png'),
  'file-configuration': require('@/assets/images/configuration.png'),
  'file-diagram': require('@/assets/images/diagram.png'),
  'file-document': require('@/assets/images/document.png'),
  'file-font': require('@/assets/images/font.png'),
  'file-image': require('@/assets/images/image.png'),
  'file-material': require('@/assets/images/material.png'),
  'file-message': require('@/assets/images/message.png'),
  'file-model': require('@/assets/images/model.png'),
  'file-object': require('@/assets/images/object.png'),
  'file-presentation': require('@/assets/images/presentation.png'),
  'file-rom': require('@/assets/images/rom.png'),
  'file-save': require('@/assets/images/savefile.png'),
  'file-spreadsheet': require('@/assets/images/spreadsheet.png'),
  'file-text': require('@/assets/images/text.png'),
  'file-unknown': require('@/assets/images/unknown.png'),
  'file-video': require('@/assets/images/video.png'),
  'folder': require('@/assets/images/folder.png'),
  'plus': require('@/assets/images/plus.png'),
};

// TODO because we load so many images at a time, this might have poor performance
function pickImage(img: Icons): ImageRequireSource {
  return icons[img];
}

export default function PloiuCon(props: PloiuConProps) {
  const baseProps: Omit<PloiuConProps, 'icon'> = props;
  return (
    <Image
      source={pickImage(props.icon)}
      resizeMode={'contain'}
      {...baseProps}
    />
  );
}
