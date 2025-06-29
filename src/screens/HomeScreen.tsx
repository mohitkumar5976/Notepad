import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Note } from '../types/note';
import { Swipeable } from 'react-native-gesture-handler';
import { exportNote } from '../components/shareNote';
import {
  TrashIcon,
  PlusIcon,
  StarIcon,
  ShareIcon,
} from 'react-native-heroicons/outline';

type Props = NativeStackScreenProps<RootStackParamList, 'Notes'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadNotes);
    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    setLoading(true);
    fadeAnim.setValue(0); // Reset animation
    try {
      const data = await AsyncStorage.getItem('notes');
      const parsedNotes: Note[] = data ? JSON.parse(data) : [];
      setNotes(parsedNotes);
      setFilteredNotes(parsedNotes);
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save notes', error);
    }
  };

  const deleteNote = (noteToDelete: Note) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = notes.filter(note => note.id !== noteToDelete.id);
          await saveNotes(updated);
        },
      },
    ]);
  };

  const togglePin = (id: string) => {
    const updated = notes.map(note =>
      note.id === id
        ? { ...note, pinned: !note.pinned, timestamp: Date.now() }
        : note
    );
    saveNotes(updated);
  };

  const formatTimestamp = (ts: number) =>
    new Date(ts).toLocaleString();

  const getSortedNotes = useCallback(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return b.timestamp - a.timestamp;
      }
      return a.pinned ? -1 : 1;
    });
  }, [filteredNotes]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();
      if (query === '') {
        setFilteredNotes(notes);
      } else {
        const filtered = notes.filter(
          note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
        setFilteredNotes(filtered);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, notes]);

  const renderRightActions = (item: Note) => (
    <TouchableOpacity
      onPress={() => deleteNote(item)}
      style={[
        styles.deleteButton,
        { backgroundColor: isDarkMode ? '#B91C1C' : '#EF4444' },
      ]}
    >
      <TrashIcon color="white" size={24} />
    </TouchableOpacity>
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={styles.noteWrapper}>
      <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddNote', {
              existingNote: item,
              noteIndex: notes.findIndex(n => n.id === item.id),
            })
          }
          style={[
            styles.noteCard,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
              borderColor: isDarkMode ? '#334155' : '#D1D5DB',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => exportNote(item)}
            style={styles.shareIcon}
          >
            <ShareIcon size={22} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => togglePin(item.id)}
            style={styles.pinIcon}
          >
            <StarIcon
              size={22}
              color={
                item.pinned
                  ? '#FACC15'
                  : '#9CA3AF'
              }
              strokeWidth={item.pinned ? 2 : 1}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={{
              color: isDarkMode ? '#E5E7EB' : '#374151',
              paddingRight: 28,
            }}
            numberOfLines={2}
          >
            {item.content}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? '#9CA3AF' : '#6B7280',
              marginTop: 4,
            }}
          >
            Last edited: {formatTimestamp(item.timestamp)}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' },
      ]}
    >
      <View style={styles.inner}>
        <TextInput
          placeholder="Search notes..."
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
              color: isDarkMode ? '#F9FAFB' : '#1F2937',
              borderColor: isDarkMode ? '#334155' : '#D1D5DB',
            },
          ]}
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={isDarkMode ? '#60A5FA' : '#3B82F6'}
            />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <FlatList
              data={getSortedNotes()}
              keyExtractor={item => item.id}
              renderItem={renderNoteItem}
              ListEmptyComponent={
                <Text
                  style={{
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    textAlign: 'center',
                    marginTop: 20,
                  }}
                >
                  No notes found.
                </Text>
              }
            />
          </Animated.View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddNote')}
        style={[
          styles.fab,
          { backgroundColor: isDarkMode ? '#2563EB' : '#3B82F6' },
        ]}
      >
        <PlusIcon size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  noteWrapper: {
    marginBottom: 12,
  },
  noteCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  pinIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  shareIcon: {
    position: 'absolute',
    bottom: 14,
    right: 10,
    zIndex: 1,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    paddingRight: 28,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    padding: 16,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
