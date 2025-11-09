
export type ExerciseType = 'strength' | 'cardio' | 'endurance' | 'stretch';

export interface StrengthSet {
  weight: number;
  reps: number;
}

export interface CardioData {
  time: number; // minutes
  level: number;
  distance: number; // km
}

export interface EnduranceData {
  time: number; // minutes
  distance: number; // km
  pace?: number; // calculated: min/km
}

export interface StretchData {
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  lastPerformed?: string; // ISO date
  lastData?: StrengthSet[] | CardioData | EnduranceData | StretchData;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  lastPerformed?: string; // ISO date
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  templateName: string;
  date: string; // ISO date
  exercises: {
    exerciseId: string;
    exerciseName: string;
    type: ExerciseType;
    data: StrengthSet[] | CardioData | EnduranceData | StretchData;
  }[];
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO date
  weight?: number;
  upperArm?: number;
  forearm?: number;
  thigh?: number;
  calf?: number;
  chest?: number;
  waist?: number;
  hips?: number;
}
