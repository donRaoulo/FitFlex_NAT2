
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
  saveWorkoutSessions 
} from '@/utils/storage';
import { WorkoutTemplate, WorkoutSession, StrengthSet, CardioData, EnduranceData } from '@/types/workout';

export default function StartWorkoutScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const templateId = params.templateId as string;
  
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [exerciseData, setExerciseData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadTemplate = useCallback(async () => {
    const templates = await getWorkoutTemplates();
    const foundTemplate = templates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      // Initialize exercise data
      const initialData: any = {};
      foundTemplate.exercises.forEach(exercise => {
        if (exercise.type === 'strength') {
          initialData[exercise.id] = [{ weight: '', reps: '' }];
        } else if (exercise.type === 'cardio') {
          initialData[exercise.id] = { time: '', level: '', distance: '' };
        } else if (exercise.type === 'endurance') {
          initialData[exercise.id] = { time: '', distance: '' };
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

  const handleFinish = async () => {
    if (!template) return;

    // Validate that at least some data was entered
    let hasData = false;
    for (const exercise of template.exercises) {
      const data = exerciseData[exercise.id];
      if (exercise.type === 'strength' && Array.isArray(data)) {
        if (data.some((set: any) => set.weight || set.reps)) {
          hasData = true;
          break;
        }
      } else if (data && (data.time || data.distance || data.level)) {
        hasData = true;
        break;
      }
    }

    if (!hasData) {
      Alert.alert('Fehler', 'Bitte trage mindestens einen Wert ein');
      return;
    }

    const sessions = await getWorkoutSessions();
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      templateId: template.id,
      templateName: template.name,
      date: new Date().toISOString(),
      exercises: template.exercises.map(exercise => {
        let data: any;
        if (exercise.type === 'strength') {
          data = exerciseData[exercise.id]
            .filter((set: any) => set.weight && set.reps)
            .map((set: any) => ({
              weight: parseFloat(set.weight),
              reps: parseInt(set.reps),
            }));
        } else if (exercise.type === 'cardio') {
          const cardioData = exerciseData[exercise.id];
          data = {
            time: parseFloat(cardioData.time) || 0,
            level: parseInt(cardioData.level) || 0,
            distance: parseFloat(cardioData.distance) || 0,
          };
        } else if (exercise.type === 'endurance') {
          const enduranceData = exerciseData[exercise.id];
          const time = parseFloat(enduranceData.time) || 0;
          const distance = parseFloat(enduranceData.distance) || 0;
          data = {
            time,
            distance,
            pace: distance > 0 ? time / distance : 0,
          };
        }
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: exercise.type,
          data,
        };
      }),
    };

    await saveWorkoutSessions([...sessions, newSession]);
    Alert.alert('Erfolg', 'Training wurde gespeichert', [
      { text: 'OK', onPress: () => router.back() },
    ]);
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
                  {exercise.type === 'strength' ? 'Krafttraining' : 
                   exercise.type === 'cardio' ? 'Cardio' : 'Ausdauer'}
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
                      style={[styles.setInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      value={set.weight}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'weight', value)}
                      placeholder="kg"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                    <Text style={[styles.setLabel, { color: colors.textSecondary }]}>×</Text>
                    <TextInput
                      style={[styles.setInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      value={set.reps}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                      placeholder="Wdh"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
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
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
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
    gap: 8,
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
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
