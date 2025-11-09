
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  getExercises,
  saveExercises,
  savePendingExerciseSelection,
} from '@/utils/storage';
import { getExerciseTypeLabel } from '@/utils/exercise';
import { Exercise, ExerciseType } from '@/types/workout';

export default function SelectExerciseScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const modeParam = (params.mode as string) || 'create';
  const mode = modeParam === 'edit' ? 'edit' : 'create';
  const templateId = params.templateId as string;
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadExercises = useCallback(async () => {
    const loadedExercises = await getExercises();
    
    // Add default exercises if none exist
    if (loadedExercises.length === 0) {
      const defaultExercises: Exercise[] = [
        { id: '1', name: 'Bankdrücken', type: 'strength' },
        { id: '2', name: 'Kniebeugen', type: 'strength' },
        { id: '3', name: 'Kreuzheben', type: 'strength' },
        { id: '4', name: 'Schulterdrücken', type: 'strength' },
        { id: '5', name: 'Bizeps Curls', type: 'strength' },
        { id: '6', name: 'Trizeps Dips', type: 'strength' },
        { id: '7', name: 'Klimmzüge', type: 'strength' },
        { id: '8', name: 'Rudern', type: 'strength' },
        { id: '9', name: 'Laufband', type: 'cardio' },
        { id: '10', name: 'Fahrrad', type: 'cardio' },
        { id: '11', name: 'Crosstrainer', type: 'cardio' },
        { id: '12', name: 'Laufen', type: 'endurance' },
        { id: '13', name: 'Radfahren', type: 'endurance' },
        { id: '14', name: 'Ganzkörper Dehnen', type: 'stretch' },
      ];
      await saveExercises(defaultExercises);
      setExercises(defaultExercises);
    } else {
      setExercises(loadedExercises);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectExercise = async (exercise: Exercise) => {
    console.log('Exercise selected:', exercise);
    await savePendingExerciseSelection({
      mode,
      templateId: mode === 'edit' ? templateId : undefined,
      exercise,
    });
    router.back();
  };

  const createNewExercise = () => {
    router.push({
      pathname: '/create-exercise',
      params: { mode, templateId }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Übung auswählen</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Übung suchen..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={createNewExercise}
        >
          <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Neue Übung erstellen</Text>
        </TouchableOpacity>

        {filteredExercises.map(exercise => (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.exerciseCard, { backgroundColor: colors.card }]}
            onPress={() => selectExercise(exercise)}
          >
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              <Text style={[styles.exerciseType, { color: colors.textSecondary }]}>
                {getExerciseTypeLabel(exercise.type)}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
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
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 14,
  },
});
