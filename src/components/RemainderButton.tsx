import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  CalendarDaysIcon,
  XMarkIcon,
  CheckIcon,
} from 'react-native-heroicons/outline';
import Toast from 'react-native-toast-message';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';

interface Props {
  reminderDate: Date | null;
  setReminderDate: (date: Date) => void;
  isDarkMode: boolean;
  disabled?: boolean;
  noteId: string;
  title: string;
}

const ReminderButton: React.FC<Props> = ({
  reminderDate,
  setReminderDate,
  isDarkMode,
  disabled = false,
  noteId,
  title,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const setupNotificationChannel = async () => {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'reminder',
        name: 'Reminder Notifications',
        importance: AndroidImportance.HIGH,
      });
    };

    setupNotificationChannel();
  }, []);

  const openReminderModal = () => {
    setSelectedDate(reminderDate ?? new Date());
    setOpen(true);
    if (Platform.OS === 'ios') {
      setShowDatePicker(true);
      setShowTimePicker(true);
    }
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const updated = new Date(date);
      updated.setHours(selectedDate.getHours());
      updated.setMinutes(selectedDate.getMinutes());
      setSelectedDate(updated);
      if (Platform.OS === 'android') setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      const updated = new Date(selectedDate);
      updated.setHours(time.getHours());
      updated.setMinutes(time.getMinutes());
      setSelectedDate(updated);
    }
  };

  const confirmReminder = async () => {
    const now = Date.now();
    const triggerTime = selectedDate.getTime();

    if (triggerTime <= now) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Reminder',
        text2: 'Please choose a future time.',
        position: 'bottom',
      });
      return;
    }

    setReminderDate(selectedDate);
    setOpen(false);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime,
      alarmManager: true,
    };

    try {
      await notifee.createTriggerNotification(
        {
          title: '⏰ Reminder',
          body: `Reminder for "${title}`,
          android: {
            channelId: 'reminder',
            pressAction: { id: 'default' },
          },
          data: {
            noteId,
          },
        },
        trigger,
      );

      Toast.show({
        type: 'success',
        text1: 'Reminder Set',
        text2: selectedDate.toLocaleString(),
        position: 'bottom',
      });
    } catch (error) {
      console.error('Notification scheduling error:', error);
      Alert.alert('Error', 'Failed to schedule the reminder.');
    }
  };

  return (
    <View>
      <TouchableOpacity
        disabled={disabled}
        onPress={openReminderModal}
        style={{
          padding: 10,
          borderRadius: 8,
          backgroundColor: disabled
            ? isDarkMode
              ? '#3A3A3C'
              : '#E5E7EB'
            : '#2563EB',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <CalendarDaysIcon color={disabled ? '#9CA3AF' : '#fff'} size={22} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? '#1F2937' : '#fff',
              padding: 20,
              borderRadius: 12,
              width: '90%',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
                color: isDarkMode ? '#fff' : '#000',
                textAlign: 'center',
              }}
            >
              Select Reminder Date & Time
            </Text>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: '#F3F4F6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text>{selectedDate.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: '#9CA3AF',
                  borderRadius: 6,
                  marginRight: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <XMarkIcon color="#fff" size={18} />
                <Text style={{ color: '#fff', marginLeft: 6 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmReminder}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: '#2563EB',
                  borderRadius: 6,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon color="#fff" size={18} />
                <Text style={{ color: '#fff', marginLeft: 6 }}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReminderButton;
