
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getBodyMeasurements, saveBodyMeasurements } from '@/utils/storage';
import { BodyMeasurement } from '@/types/workout';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

type MeasurementKey = keyof Omit<BodyMeasurement, 'id' | 'date'>;

const measurementFieldMeta: { key: MeasurementKey; label: string; unit: string }[] = [
  { key: 'weight', label: 'Gewicht', unit: 'kg' },
  { key: 'chest', label: 'Brust', unit: 'cm' },
  { key: 'waist', label: 'Taille', unit: 'cm' },
  { key: 'hips', label: 'Po', unit: 'cm' },
  { key: 'upperArm', label: 'Oberarm', unit: 'cm' },
  { key: 'forearm', label: 'Unterarm', unit: 'cm' },
  { key: 'thigh', label: 'Oberschenkel', unit: 'cm' },
  { key: 'calf', label: 'Unterschenkel', unit: 'cm' },
];

const measurementIcons: Record<MeasurementKey, string> = {
  weight: 'scalemass',
  chest: 'figure.arms.open',
  waist: 'figure.stand',
  hips: 'figure.stand',
  upperArm: 'figure.strengthtraining.traditional',
  forearm: 'hand.raised',
  thigh: 'figure.walk',
  calf: 'figure.walk',
};

export default function BodyDataScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const loadMeasurements = useCallback(async () => {
    const loadedMeasurements = await getBodyMeasurements();
    setMeasurements(loadedMeasurements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);

  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  useFocusEffect(
    useCallback(() => {
      loadMeasurements();
    }, [loadMeasurements]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeasurements();
    setRefreshing(false);
  };

  const getLatestMeasurement = () => {
    return measurements.length > 0 ? measurements[0] : null;
  };

  const latest = getLatestMeasurement();

  const deleteMeasurementById = useCallback(async (id: string) => {
    setMeasurements((prev) => {
      const updated = prev.filter((measurement) => measurement.id !== id);
      void saveBodyMeasurements(updated);
      return updated;
    });
  }, []);

  const handleDeleteMeasurement = useCallback(
    (id: string) => {
      if (Platform.OS === 'web') {
        setPendingDeleteId(id);
        return;
      }

      Alert.alert('Messung lösche', 'Möchtest du diese Messung wirklich löschen?', [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            void deleteMeasurementById(id);
          },
        },
      ]);
    },
    [deleteMeasurementById],
  );

  const confirmWebDeletion = useCallback(() => {
    if (!pendingDeleteId) {
      return;
    }
    void deleteMeasurementById(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, deleteMeasurementById]);

  const cancelWebDeletion = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  return (
    <>
      {Platform.OS === 'android' && (
        <Stack.Screen
          options={{
            title: 'Körperdaten',
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Platform.OS !== 'ios' && (
            <Text style={[styles.header, { color: colors.text,  textAlign: 'center' }]}>Körperdaten</Text>
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-measurement')}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Neue Messung hinzufügen</Text>
          </TouchableOpacity>

          {latest && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Aktuelle Werte
              </Text>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  {new Date(latest.date).toLocaleDateString('de-DE')}
                </Text>
                <View style={styles.measurementGrid}>
                  {measurementFieldMeta.map(({ key, label, unit }) => {
                    const value = latest[key];
                    if (value == null) {
                      return null;
                    }

                    return (
                      <View key={key} style={styles.measurementItem}>
                        <IconSymbol
                          name={measurementIcons[key] as any}
                          size={24}
                          color={colors.primary}
                        />
                        <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>
                          {label}
                        </Text>
                        <Text style={[styles.measurementValue, { color: colors.text }]}>
                          {value} {unit}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Verlauf
            </Text>
            {measurements.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <IconSymbol
                  name="chart.line.uptrend.xyaxis"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Noch keine Messungen vorhanden
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Füge deine erste Messung hinzu
                </Text>
              </View>
            ) : (
              measurements.map((measurement) => (
                <View
                  key={measurement.id}
                  style={[styles.historyCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyDate, { color: colors.text }]}>
                      {new Date(measurement.date).toLocaleDateString('de-DE')}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMeasurement(measurement.id)}
                      accessibilityLabel="Messung lösche"
                    >
                      <IconSymbol name="trash" size={18} color={colors.error ?? '#F44336'} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.historyValues}>
                    {measurementFieldMeta.map(({ key, label, unit }) => {
                      const value = measurement[key];
                      if (value == null) {
                        return null;
                      }

                      return (
                        <Text
                          key={key}
                          style={[styles.historyValue, { color: colors.textSecondary }]}
                        >
                          {label}: {value} {unit}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
      {Platform.OS === 'web' && (
        <Dialog
          open={Boolean(pendingDeleteId)}
          onClose={cancelWebDeletion}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              minWidth: 320,
              backgroundColor: colors.card,
            },
          }}
        >
          <DialogTitle sx={{ color: colors.text }}>Messung löschen?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: colors.textSecondary }}>
              Diese Messung wird dauerhaft entfernt.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '10px' }}>
            <Button onClick={cancelWebDeletion} sx={{ color: colors.text }}>
              Abbrechen
            </Button>
            <Button
              onClick={confirmWebDeletion}
              variant="contained"
              color="error"
              sx={{ borderRadius: '999px' }}
            >
              Löschen
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  measurementItem: {
    width: '47%',
    alignItems: 'center',
    padding: 12,
  },
  measurementLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyValues: {
    gap: 4,
  },
  historyValue: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
});
