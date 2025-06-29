import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import uuid from 'react-native-uuid';

import { Note } from '../types/note';
import ReminderButton from '../components/RemainderButton';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddNote'>;

const AddNoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  // Load note from AsyncStorage
  useEffect(() => {
    const loadNote = async () => {
      if (route.params?.existingNote?.id) {
        try {
          const stored = await AsyncStorage.getItem('notes');
          const notes: Note[] = stored ? JSON.parse(stored) : [];
          const note = notes.find(n => n.id === route.params?.existingNote?.id);
          if (note) {
            setNoteId(note.id);
            setTitle(note.title);
            setContent(note.content);
            setTimestamp(note.timestamp);
            setReminderDate(
              note.reminderDate ? new Date(note.reminderDate) : null,
            );
          }
        } catch (e) {
          console.error('Failed to load note:', e);
        }
      } else if (route.params?.existingNote) {
        const note = route.params.existingNote;
        setNoteId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setTimestamp(note.timestamp);
        setReminderDate(note.reminderDate ? new Date(note.reminderDate) : null);
      }
    };

    loadNote();
  }, [route.params]);

  const saveNote = async () => {
    if (!isFormValid) return;

    try {
      const existing = await AsyncStorage.getItem('notes');
      const notes: Note[] = existing ? JSON.parse(existing) : [];

      let currentNoteId = noteId;
      const noteIndex = currentNoteId
        ? notes.findIndex(n => n.id === currentNoteId)
        : -1;

      let newNote: Note;

      if (noteIndex === -1) {
        currentNoteId = uuid.v4().toString();
        newNote = {
          id: currentNoteId,
          title,
          content,
          timestamp: Date.now(),
          reminderDate: reminderDate ? reminderDate.toISOString() : undefined,
        };
        notes.push(newNote);
        setNoteId(currentNoteId);
      } else {
        const oldNote = notes[noteIndex];
        newNote = {
          ...oldNote,
          title,
          content,
          timestamp: Date.now(),
          reminderDate: reminderDate ? reminderDate.toISOString() : undefined,
        };
        notes[noteIndex] = newNote;
      }

      setTimestamp(newNote.timestamp);
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      saveNote();
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, content, reminderDate]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ReminderButton
          title={title}
          reminderDate={reminderDate}
          setReminderDate={setReminderDate}
          isDarkMode={isDarkMode}
          disabled={!isFormValid}
          noteId={noteId || ''}
        />
      ),
    });
  }, [navigation, reminderDate, isDarkMode, isFormValid, noteId, title]);

  const formatTimestamp = (ts: number) => {
    return new Intl.DateTimeFormat('default', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#1C1C1E' : '#F9FAFB',
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            flex: 1,
          }}
        >
          <TextInput
            placeholder="Note title"
            value={title}
            onChangeText={setTitle}
            style={{
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 14,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderColor: isDarkMode ? '#3A3A3C' : '#E5E7EB',
              color: isDarkMode ? '#FFFFFF' : '#111827',
            }}
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
          />

          {timestamp && (
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? '#A1A1AA' : '#6B7280',
                marginBottom: 10,
              }}
            >
              Last edited: {formatTimestamp(timestamp)}
            </Text>
          )}

          <TextInput
            placeholder="Start writing your thoughts here..."
            value={content}
            onChangeText={setContent}
            multiline
            style={{
              fontSize: 16,
              textAlignVertical: 'top',
              minHeight: 160,
              lineHeight: 24,
              borderRadius: 12,
              color: isDarkMode ? '#E5E5E5' : '#1F2937',
            }}
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddNoteScreen;
