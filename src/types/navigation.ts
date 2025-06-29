import { Note } from './note';

export type RootStackParamList = {
  Notes: undefined;
  AddNote: { existingNote?: Note; noteIndex?: number } | undefined;
  PinnedNotes: undefined;
};
