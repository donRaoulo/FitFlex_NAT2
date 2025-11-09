
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, WorkoutSession, BodyMeasurement, Exercise } from '@/types/workout';

const KEYS = {
  TEMPLATES: '@workout_templates',
  SESSIONS: '@workout_sessions',
  MEASUREMENTS: '@body_measurements',
  EXERCISES: '@exercises',
  DARK_MODE: '@dark_mode',
};

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
