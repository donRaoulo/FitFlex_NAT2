
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, WorkoutSession, BodyMeasurement, Exercise } from '@/types/workout';

const KEYS = {
  TEMPLATES: '@workout_templates',
  SESSIONS: '@workout_sessions',
  MEASUREMENTS: '@body_measurements',
  EXERCISES: '@exercises',
  EXERCISE_SELECTION: '@pending_exercise_selection',
  DARK_MODE: '@dark_mode',
  DASHBOARD_SESSION_LIMIT: '@dashboard_session_limit',
};

export const DEFAULT_DASHBOARD_SESSION_LIMIT = 5;

type ExerciseSelectionMode = 'create' | 'edit';

interface PendingExerciseSelection {
  mode: ExerciseSelectionMode;
  templateId?: string;
  exercise: Exercise;
}

// Workout Templates
export const saveWorkoutTemplates = async (templates: WorkoutTemplate[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving workout templates:', error);
  }
};

export const getWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading workout templates:', error);
    return [];
  }
};

// Workout Sessions
export const saveWorkoutSessions = async (sessions: WorkoutSession[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving workout sessions:', error);
  }
};

export const getWorkoutSessions = async (): Promise<WorkoutSession[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading workout sessions:', error);
    return [];
  }
};

// Body Measurements
export const saveBodyMeasurements = async (measurements: BodyMeasurement[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(measurements));
  } catch (error) {
    console.error('Error saving body measurements:', error);
  }
};

export const getBodyMeasurements = async (): Promise<BodyMeasurement[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MEASUREMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading body measurements:', error);
    return [];
  }
};

// Exercises
export const saveExercises = async (exercises: Exercise[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (error) {
    console.error('Error saving exercises:', error);
  }
};

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXERCISES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading exercises:', error);
    return [];
  }
};

export const savePendingExerciseSelection = async (
  selection: PendingExerciseSelection
): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.EXERCISE_SELECTION, JSON.stringify(selection));
  } catch (error) {
    console.error('Error saving pending exercise selection:', error);
  }
};

export const consumePendingExerciseSelection = async (
  mode: ExerciseSelectionMode,
  templateId?: string
): Promise<Exercise | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXERCISE_SELECTION);
    if (!data) {
      return null;
    }

    const selection: PendingExerciseSelection = JSON.parse(data);
    const modeMatches = selection.mode === mode;
    const templateMatches =
      mode === 'create' || selection.templateId === templateId;

    if (modeMatches && templateMatches) {
      await AsyncStorage.removeItem(KEYS.EXERCISE_SELECTION);
      return selection.exercise;
    }

    return null;
  } catch (error) {
    console.error('Error consuming pending exercise selection:', error);
    return null;
  }
};

export const saveDashboardSessionLimit = async (limit: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.DASHBOARD_SESSION_LIMIT, JSON.stringify(limit));
  } catch (error) {
    console.error('Error saving dashboard session limit:', error);
  }
};

export const getDashboardSessionLimit = async (): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DASHBOARD_SESSION_LIMIT);
    const parsed = data ? JSON.parse(data) : null;
    if (typeof parsed === 'number' && parsed > 0) {
      return parsed;
    }
    return DEFAULT_DASHBOARD_SESSION_LIMIT;
  } catch (error) {
    console.error('Error loading dashboard session limit:', error);
    return DEFAULT_DASHBOARD_SESSION_LIMIT;
  }
};

// Dark Mode
export const saveDarkMode = async (isDark: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.DARK_MODE, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving dark mode:', error);
  }
};

export const getDarkMode = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DARK_MODE);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error loading dark mode:', error);
    return false;
  }
};
