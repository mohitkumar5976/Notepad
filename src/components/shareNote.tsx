import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert } from 'react-native';
import { Note } from '../types/note';

const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-z0-9_\- ]/gi, '_').trim();
};

export const exportNote = async (note: Note) => {
  try {
    const fileName = sanitizeFileName(note.title || 'note') + '.txt';
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    const fileContent = `Title: ${note.title}\n\nContent:\n${note.content}`;

    await RNFS.writeFile(path, fileContent, 'utf8');

    await Share.open({
      title: 'Share Note',
      message: `Sharing note: ${note.title}`,
      url: 'file://' + path,
      type: 'text/plain',
      failOnCancel: false,
    });
  } catch (error) {
    console.error('Error exporting note:', error);
    Alert.alert('Export Failed', 'Unable to export the note.');
  }
};
