// it's a pun...get it? Ploiu Icon => PloiuCon
// ...ok it's bad, but it flows better

import { Image, ImageRequireSource } from 'react-native';
import * as React from 'react';
import { ImageProps } from 'react-native/Libraries/Image/Image';

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

// TODO because we load so many images at a time, this might have poor performance
function pickImage(img: Icons): ImageRequireSource {
  // react's require is a bit different from node's, so we can't just use an if statement and have to map out everything manually
  switch (img) {
    case 'file-application':
      return require('@/assets/images/application.png');
    case 'file-archive':
      return require('@/assets/images/archive.png');
    case 'file-audio':
      return require('@/assets/images/audio.png');
    case 'file-cad':
      return require('@/assets/images/cad.png');
    case 'file-code':
      return require('@/assets/images/code.png');
    case 'file-configuration':
      return require('@/assets/images/configuration.png');
    case 'file-diagram':
      return require('@/assets/images/diagram.png');
    case 'file-document':
      return require('@/assets/images/document.png');
    case 'file-unknown':
      return require('@/assets/images/unknown.png');
    case 'folder':
      return require('@/assets/images/folder.png');
    case 'file-font':
      return require('@/assets/images/font.png');
    case 'file-image':
      return require('@/assets/images/image.png');
    case 'file-material':
      return require('@/assets/images/material.png');
    case 'file-message':
      return require('@/assets/images/message.png');
    case 'file-model':
      return require('@/assets/images/model.png');
    case 'file-object':
      return require('@/assets/images/object.png');
    case 'plus':
      return require('@/assets/images/plus.png');
    case 'file-presentation':
      return require('@/assets/images/presentation.png');
    case 'file-rom':
      return require('@/assets/images/rom.png');
    case 'file-save':
      return require('@/assets/images/savefile.png');
    case 'file-spreadsheet':
      return require('@/assets/images/spreadsheet.png');
    case 'file-text':
      return require('@/assets/images/text.png');
    case 'file-video':
      return require('@/assets/images/video.png');
  }
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
