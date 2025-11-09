
import { WorkoutSession, BodyMeasurement } from '@/types/workout';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export const exportWorkoutsToCSV = async (sessions: WorkoutSession[]): Promise<void> => {
  try {
    let csv = 'Datum,Training,Übung,Typ,Details\n';
    
    sessions.forEach(session => {
      const date = new Date(session.date).toLocaleDateString('de-DE');
      session.exercises.forEach(exercise => {
        let details = '';
        if (exercise.type === 'strength' && Array.isArray(exercise.data)) {
          details = exercise.data.map((set: any) => `${set.weight}kg x ${set.reps}`).join('; ');
        } else if (exercise.type === 'cardio') {
          const data = exercise.data as any;
          details = `${data.time}min, Stufe ${data.level}, ${data.distance}km`;
        } else if (exercise.type === 'endurance') {
          const data = exercise.data as any;
          details = `${data.time}min, ${data.distance}km, Pace: ${data.pace?.toFixed(2)}min/km`;
        }
        csv += `${date},${session.templateName},${exercise.exerciseName},${exercise.type},${details}\n`;
      });
    });

    if (Platform.OS === 'web') {
      // Web download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `trainings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Erfolg', 'Trainingsdaten wurden exportiert');
    } else {
      // Mobile sharing
      const fileUri = `${FileSystem.documentDirectory ?? ''}trainings_${new Date().toISOString().split('T')[0]}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Fehler', 'Teilen ist auf diesem Gerät nicht verfügbar');
      }
    }
  } catch (error) {
    console.error('Error exporting workouts:', error);
    Alert.alert('Fehler', 'Fehler beim Exportieren der Trainingsdaten');
  }
};

export const exportBodyDataToCSV = async (measurements: BodyMeasurement[]): Promise<void> => {
  try {
    let csv = 'Datum,Gewicht,Oberarm,Unterarm,Oberschenkel,Unterschenkel,Brustumfang,Taille,Po\n';
    
    measurements.forEach(m => {
      const date = new Date(m.date).toLocaleDateString('de-DE');
      csv += `${date},${m.weight || ''},${m.upperArm || ''},${m.forearm || ''},${m.thigh || ''},${m.calf || ''},${m.chest || ''},${m.waist || ''},${m.hips || ''}\n`;
    });

    if (Platform.OS === 'web') {
      // Web download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `koerperdaten_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Erfolg', 'Körperdaten wurden exportiert');
    } else {
      // Mobile sharing
      const fileUri = `${FileSystem.documentDirectory ?? ''}koerperdaten_${new Date().toISOString().split('T')[0]}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Fehler', 'Teilen ist auf diesem Gerät nicht verfügbar');
      }
    }
  } catch (error) {
    console.error('Error exporting body data:', error);
    Alert.alert('Fehler', 'Fehler beim Exportieren der Körperdaten');
  }
};
