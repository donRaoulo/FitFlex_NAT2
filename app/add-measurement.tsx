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
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { colors as lightColors } from '@/styles/commonStyles';
import { getBodyMeasurements, saveBodyMeasurements } from '@/utils/storage';
import { BodyMeasurement } from '@/types/workout';

type ColorPalette = typeof lightColors;

type MeasurementInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  icon: string;
  colors: ColorPalette;
};

const MeasurementInput = ({
  label,
  value,
  onChangeText,
  unit,
  icon,
  colors,
}: MeasurementInputProps) => (
  <View style={[styles.inputCard, { backgroundColor: colors.card }]}>
    <View style={styles.inputHeader}>
      <IconSymbol name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
    </View>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
    </View>
  </View>
);

export default function AddMeasurementScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [upperArm, setUpperArm] = useState('');
  const [forearm, setForearm] = useState('');
  const [thigh, setThigh] = useState('');
  const [calf, setCalf] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');

  const handleSave = async () => {
    if (!weight && !upperArm && !forearm && !thigh && !calf && !chest && !waist && !hips) {
      Alert.alert('Fehler', 'Bitte fülle mindestens ein Feld aus');
      return;
    }

    try {
      const measurements = await getBodyMeasurements();
      const newMeasurement: BodyMeasurement = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        weight: weight ? parseFloat(weight) : undefined,
        upperArm: upperArm ? parseFloat(upperArm) : undefined,
        forearm: forearm ? parseFloat(forearm) : undefined,
        thigh: thigh ? parseFloat(thigh) : undefined,
        calf: calf ? parseFloat(calf) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        hips: hips ? parseFloat(hips) : undefined,
      };

      await saveBodyMeasurements([...measurements, newMeasurement]);
      router.back();
    } catch (error) {
      Alert.alert('Fehler', 'Die Messung konnte nicht gespeichert werden. Bitte versuche es erneut.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Neue Messung</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Speichern</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Koerpermasse</Text>

        <MeasurementInput
          label="Gewicht"
          value={weight}
          onChangeText={setWeight}
          unit="kg"
          icon="scalemass"
          colors={colors}
        />

        <MeasurementInput
          label="Brustumfang"
          value={chest}
          onChangeText={setChest}
          unit="cm"
          icon="figure.arms.open"
          colors={colors}
        />

        <MeasurementInput
          label="Taille"
          value={waist}
          onChangeText={setWaist}
          unit="cm"
          icon="figure.stand"
          colors={colors}
        />

        <MeasurementInput
          label="Po-Umfang"
          value={hips}
          onChangeText={setHips}
          unit="cm"
          icon="figure.stand"
          colors={colors}
        />

        <MeasurementInput
          label="Oberarm"
          value={upperArm}
          onChangeText={setUpperArm}
          unit="cm"
          icon="figure.strengthtraining.traditional"
          colors={colors}
        />

        <MeasurementInput
          label="Unterarm"
          value={forearm}
          onChangeText={setForearm}
          unit="cm"
          icon="hand.raised"
          colors={colors}
        />

        <MeasurementInput
          label="Oberschenkel"
          value={thigh}
          onChangeText={setThigh}
          unit="cm"
          icon="figure.walk"
          colors={colors}
        />

        <MeasurementInput
          label="Unterschenkel"
          value={calf}
          onChangeText={setCalf}
          unit="cm"
          icon="figure.walk"
          colors={colors}
        />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
  },
});
