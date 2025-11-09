
import React, { useState, useEffect, useCallback } from 'react';
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
import {
  getWorkoutTemplates,
  getWorkoutSessions,
  saveWorkoutSessions,
} from '@/utils/storage';
import { WorkoutTemplate, WorkoutSession, StrengthSet } from '@/types/workout';
import { getExerciseTypeLabel } from '@/utils/exercise';

export default function StartWorkoutScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const templateId = params.templateId as string;
  
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [exerciseData, setExerciseData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const getLatestExerciseValues = (sessions: WorkoutSession[]) => {
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const map: Record<string, StrengthSet[] | any> = {};
    for (const session of sorted) {
      for (const exercise of session.exercises) {
        if (map[exercise.exerciseId] == null) {
          map[exercise.exerciseId] = exercise.data;
        }
      }
    }
    return map;
  };

  const loadTemplate = useCallback(async () => {
    const [templates, sessions] = await Promise.all([
      getWorkoutTemplates(),
      getWorkoutSessions(),
    ]);
    const foundTemplate = templates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      const lastValues = getLatestExerciseValues(sessions);
      const initialData: any = {};
      foundTemplate.exercises.forEach(exercise => {
        const previousData = lastValues[exercise.id];

        if (exercise.type === 'strength') {
          if (previousData && Array.isArray(previousData) && previousData.length > 0) {
            initialData[exercise.id] = previousData.map((set: StrengthSet) => ({
              weight: set.weight ? set.weight.toString() : '',
              reps: set.reps ? set.reps.toString() : '',
            }));
          } else {
            initialData[exercise.id] = [{ weight: '', reps: '' }];
          }
        } else if (exercise.type === 'cardio') {
          initialData[exercise.id] = {
            time: previousData?.time ? previousData.time.toString() : '',
            level: previousData?.level ? previousData.level.toString() : '',
            distance: previousData?.distance ? previousData.distance.toString() : '',
          };
        } else if (exercise.type === 'endurance') {
          initialData[exercise.id] = {
            time: previousData?.time ? previousData.time.toString() : '',
            distance: previousData?.distance ? previousData.distance.toString() : '',
          };
        } else if (exercise.type === 'stretch') {
          initialData[exercise.id] = previousData?.completed ?? false;
        }
      });
      setExerciseData(initialData);
    }
    setLoading(false);
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const addSet = (exerciseId: string) => {
    setExerciseData({
      ...exerciseData,
      [exerciseId]: [...exerciseData[exerciseId], { weight: '', reps: '' }],
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    const sets = exerciseData[exerciseId].filter((_: any, i: number) => i !== setIndex);
    setExerciseData({
      ...exerciseData,
      [exerciseId]: sets,
    });
  };

  const updateSet = (exerciseId: string, setIndex: number, field: string, value: string) => {
    const sets = [...exerciseData[exerciseId]];
    sets[setIndex] = { ...sets[setIndex], [field]: value };
    setExerciseData({
      ...exerciseData,
      [exerciseId]: sets,
    });
  };

  const updateCardio = (exerciseId: string, field: string, value: string) => {
    setExerciseData({
      ...exerciseData,
      [exerciseId]: { ...exerciseData[exerciseId], [field]: value },
    });
  };

  const toggleStretch = (exerciseId: string) => {
    setExerciseData({
      ...exerciseData,
      [exerciseId]: !exerciseData[exerciseId],
    });
  };

  const buildExerciseEntry = (
    exercise: WorkoutTemplate['exercises'][number]
  ): WorkoutSession['exercises'][number] | null => {
    const data = exerciseData[exercise.id];
    if (data == null) {
      return null;
    }

    if (exercise.type === 'strength' && Array.isArray(data)) {
      const sets = data
        .filter((set: any) => set.weight || set.reps)
        .map((set: any) => ({
          weight: parseFloat(set.weight),
          reps: parseInt(set.reps),
        }))
        .filter(
          (set: StrengthSet) =>
            !Number.isNaN(set.weight) &&
            !Number.isNaN(set.reps) &&
            set.weight > 0 &&
            set.reps > 0
        );

      if (sets.length === 0) {
        return null;
      }

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        data: sets,
      };
    }

    if (exercise.type === 'cardio') {
      const cardioData = exerciseData[exercise.id] || {};
      const time = parseFloat(cardioData.time) || 0;
      const level = parseInt(cardioData.level) || 0;
      const distance = parseFloat(cardioData.distance) || 0;
      if (time <= 0 && level <= 0 && distance <= 0) {
        return null;
      }
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        data: { time, level, distance },
      };
    }

    if (exercise.type === 'endurance') {
      const enduranceData = exerciseData[exercise.id] || {};
      const time = parseFloat(enduranceData.time) || 0;
      const distance = parseFloat(enduranceData.distance) || 0;
      if (time <= 0 && distance <= 0) {
        return null;
      }
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        data: {
          time,
          distance,
          pace: distance > 0 ? time / distance : 0,
        },
      };
    }

    if (exercise.type === 'stretch') {
      const completed = !!exerciseData[exercise.id];
      if (!completed) {
        return null;
      }
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        data: { completed: true },
      };
    }

    return null;
  };

  const handleFinish = async () => {
    if (!template) return;

    const completedExercises = template.exercises
      .map(buildExerciseEntry)
      .filter((entry): entry is WorkoutSession['exercises'][number] => entry !== null);

    if (completedExercises.length === 0) {
      Alert.alert('Fehler', 'Bitte trage mindestens einen Wert ein');
      return;
    }

    const sessions = await getWorkoutSessions();
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      templateId: template.id,
      templateName: template.name,
      date: new Date().toISOString(),
      exercises: completedExercises,
    };

    await saveWorkoutSessions([...sessions, newSession]);
    router.back();
  };

  if (loading || !template) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Lädt...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{template.name}</Text>
        <TouchableOpacity onPress={handleFinish} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Fertig</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {template.exercises.map((exercise, index) => (
          <View key={exercise.id} style={[styles.exerciseSection, { backgroundColor: colors.card }]}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseNumber, { color: colors.textSecondary }]}>
                {index + 1}
              </Text>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseType, { color: colors.textSecondary }]}>
                  {getExerciseTypeLabel(exercise.type)}
                </Text>
              </View>
            </View>

            {exercise.type === 'strength' && (
              <View style={styles.setsContainer}>
                {exerciseData[exercise.id].map((set: any, setIndex: number) => (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={[styles.setNumber, { color: colors.textSecondary }]}>
                      Satz {setIndex + 1}
                    </Text>
                    <TextInput
                      style={[
                        styles.setInput,
                        styles.setInputWeight,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={set.weight}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'weight', value)}
                      placeholder="kg"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={[styles.setLabel, { color: colors.textSecondary }]}>x</Text>
                    <TextInput
                      style={[
                        styles.setInput,
                        styles.setInputReps,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      value={set.reps}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                      placeholder="Wdh"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    {exerciseData[exercise.id].length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeSet(exercise.id, setIndex)}
                        style={styles.removeSetButton}
                      >
                        <IconSymbol name="minus.circle.fill" size={24} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.addSetButton, { backgroundColor: colors.primary }]}
                  onPress={() => addSet(exercise.id)}
                >
                  <IconSymbol name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.addSetText}>Satz hinzufügen</Text>
                </TouchableOpacity>
              </View>
            )}

            {exercise.type === 'cardio' && (
              <View style={styles.cardioContainer}>
                <View style={styles.cardioRow}>
                  <Text style={[styles.cardioLabel, { color: colors.text }]}>Zeit (min)</Text>
                  <TextInput
                    style={[styles.cardioInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={exerciseData[exercise.id].time}
                    onChangeText={(value) => updateCardio(exercise.id, 'time', value)}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.cardioRow}>
                  <Text style={[styles.cardioLabel, { color: colors.text }]}>Stufe</Text>
                  <TextInput
                    style={[styles.cardioInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={exerciseData[exercise.id].level}
                    onChangeText={(value) => updateCardio(exercise.id, 'level', value)}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.cardioRow}>
                  <Text style={[styles.cardioLabel, { color: colors.text }]}>Distanz (km)</Text>
                  <TextInput
                    style={[styles.cardioInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={exerciseData[exercise.id].distance}
                    onChangeText={(value) => updateCardio(exercise.id, 'distance', value)}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}

            {exercise.type === 'endurance' && (
              <View style={styles.cardioContainer}>
                <View style={styles.cardioRow}>
                  <Text style={[styles.cardioLabel, { color: colors.text }]}>Zeit (min)</Text>
                  <TextInput
                    style={[styles.cardioInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={exerciseData[exercise.id].time}
                    onChangeText={(value) => updateCardio(exercise.id, 'time', value)}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.cardioRow}>
                  <Text style={[styles.cardioLabel, { color: colors.text }]}>Distanz (km)</Text>
                  <TextInput
                    style={[styles.cardioInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={exerciseData[exercise.id].distance}
                    onChangeText={(value) => updateCardio(exercise.id, 'distance', value)}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
                {exerciseData[exercise.id].time && exerciseData[exercise.id].distance && (
                  <View style={styles.paceContainer}>
                    <Text style={[styles.paceLabel, { color: colors.textSecondary }]}>
                      Pace: {(parseFloat(exerciseData[exercise.id].time) / parseFloat(exerciseData[exercise.id].distance)).toFixed(2)} min/km
                    </Text>
                  </View>
                )}
              </View>
            )}

            {exercise.type === 'stretch' && (
              <TouchableOpacity
                style={[
                  styles.stretchToggle,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  exerciseData[exercise.id] && { borderColor: colors.primary, backgroundColor: colors.highlight },
                ]}
                onPress={() => toggleStretch(exercise.id)}
              >
                <IconSymbol
                  name={exerciseData[exercise.id] ? 'checkmark.circle.fill' : 'circle'}
                  size={24}
                  color={exerciseData[exercise.id] ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.stretchToggleLabel, { color: colors.text }]}>
                  abgeschlossen
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  exerciseSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
    width: 32,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 14,
  },
  setsContainer: {
    gap: 6,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumber: {
    fontSize: 14,
    width: 60,
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  setInputWeight: {
    width: 100,
  },
  setInputReps: {
    width: 80,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeSetButton: {
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  addSetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardioContainer: {
    gap: 12,
  },
  cardioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardioLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardioInput: {
    width: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  paceContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  paceLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  stretchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  stretchToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
