
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
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  getWorkoutTemplates,
  saveWorkoutTemplates,
  consumePendingExerciseSelection,
} from '@/utils/storage';
import { getExerciseTypeLabel } from '@/utils/exercise';
import { WorkoutTemplate, Exercise } from '@/types/workout';

export default function CreateTemplateScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  // Pull pending exercise selections whenever the screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const syncPendingExercise = async () => {
        const exercise = await consumePendingExerciseSelection('create');
        if (exercise && isActive) {
          setSelectedExercises(previous => {
            if (previous.find(existing => existing.id === exercise.id)) {
              return previous;
            }
            return [...previous, exercise];
          });
        }
      };

      syncPendingExercise();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleSave = async () => {
    console.log('Saving template:', templateName, selectedExercises);
    
    if (!templateName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Trainingsnamen ein');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Fehler', 'Bitte füge mindestens eine Übung hinzu');
      return;
    }

    try {
      const templates = await getWorkoutTemplates();
      const newTemplate: WorkoutTemplate = {
        id: Date.now().toString(),
        name: templateName,
        exercises: selectedExercises,
      };

      await saveWorkoutTemplates([...templates, newTemplate]);
      console.log('Template saved successfully');
      router.replace('/(tabs)/trainings');
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Fehler', 'Training konnte nicht gespeichert werden');
    }
  };

  const addExercise = () => {
    console.log('Navigating to select exercise');
    router.push('/select-exercise?mode=create');
  };

  const removeExercise = (exerciseId: string) => {
    console.log('Removing exercise:', exerciseId);
    setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Neues Training</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Speichern</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Trainingsname</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="z.B. Push-Training"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.text }]}>Übungen</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={addExercise}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Übung hinzufügen</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Noch keine Übungen hinzugefügt
              </Text>
            </View>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: colors.card }]}>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseNumber, { color: colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.exerciseType, { color: colors.textSecondary }]}>
                      {getExerciseTypeLabel(exercise.type)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(exercise.id)}
                  style={styles.removeButton}
                >
                  <IconSymbol name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseType: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
});
