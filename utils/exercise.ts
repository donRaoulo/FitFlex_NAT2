import { ExerciseType } from '@/types/workout';

export const getExerciseTypeLabel = (type: ExerciseType): string => {
  switch (type) {
    case 'strength':
      return 'Krafttraining';
    case 'cardio':
      return 'Cardio';
    case 'endurance':
      return 'Ausdauer';
    case 'stretch':
      return 'Dehnen';
    default:
      return type;
  }
};
