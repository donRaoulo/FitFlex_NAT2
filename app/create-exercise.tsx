
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getExercises, saveExercises } from '@/utils/storage';
import { Exercise, ExerciseType } from '@/types/workout';

export default function CreateExerciseScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode as string;
  const templateId = params.templateId as string;
  
  const [exerciseName, setExerciseName] = useState('');
  const [selectedType, setSelectedType] = useState<ExerciseType>('strength');

  const exerciseTypes: { type: ExerciseType; label: string; icon: string }[] = [
    { type: 'strength', label: 'Krafttraining', icon: 'figure.strengthtraining.traditional' },
    { type: 'cardio', label: 'Cardio', icon: 'heart.fill' },
    { type: 'endurance', label: 'Ausdauer', icon: 'figure.run' },
  ];

  const handleSave = async () => {
    console.log('Saving exercise:', exerciseName, selectedType);
    
    if (!exerciseName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Übungsnamen ein');
      return;
    }

    try {
      const exercises = await getExercises();
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseName,
        type: selectedType,
      };

      await saveExercises([...exercises, newExercise]);
      console.log('Exercise saved successfully');
      
      Alert.alert('Erfolg', 'Übung wurde erstellt', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to select-exercise screen with the new exercise
            if (mode === 'create') {
              router.push({
                pathname: '/select-exercise',
                params: { mode: 'create' }
              });
            } else if (mode === 'edit' && templateId) {
              router.push({
                pathname: '/select-exercise',
                params: { mode: 'edit', templateId }
              });
            } else {
              router.back();
            }
          }
        },
      ]);
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Fehler', 'Übung konnte nicht gespeichert werden');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Neue Übung</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Speichern</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Übungsname</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="z.B. Bankdrücken"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Übungstyp</Text>
          {exerciseTypes.map(type => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.typeCard,
                { backgroundColor: colors.card, borderColor: selectedType === type.type ? colors.primary : colors.border },
                selectedType === type.type && styles.typeCardSelected,
              ]}
              onPress={() => setSelectedType(type.type)}
            >
              <IconSymbol
                name={type.icon as any}
                size={32}
                color={selectedType === type.type ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.typeLabel,
                { color: selectedType === type.type ? colors.primary : colors.text }
              ]}>
                {type.label}
              </Text>
              {selectedType === type.type && (
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    gap: 12,
  },
  typeCardSelected: {
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
