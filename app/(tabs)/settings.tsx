
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  getWorkoutSessions,
  getBodyMeasurements,
  getDashboardSessionLimit,
  saveDashboardSessionLimit,
  DEFAULT_DASHBOARD_SESSION_LIMIT,
} from '@/utils/storage';
import { exportWorkoutsToCSV, exportBodyDataToCSV } from '@/utils/csvExport';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const router = useRouter();
  const [hasWorkouts, setHasWorkouts] = useState(false);
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [dashboardLimit, setDashboardLimit] = useState(DEFAULT_DASHBOARD_SESSION_LIMIT);

  const DASHBOARD_MIN = 1;
  const DASHBOARD_MAX = 10;

  useEffect(() => {
    checkData();
    loadDashboardPreference();
  }, []);

  const checkData = async () => {
    const sessions = await getWorkoutSessions();
    const measurements = await getBodyMeasurements();
    setHasWorkouts(sessions.length > 0);
    setHasMeasurements(measurements.length > 0);
  };

  const loadDashboardPreference = async () => {
    const limit = await getDashboardSessionLimit();
    setDashboardLimit(limit);
  };

  const handleExportWorkouts = async () => {
    if (!hasWorkouts) {
      Alert.alert('Keine Daten', 'Es sind noch keine Trainingsdaten vorhanden.');
      return;
    }
    const sessions = await getWorkoutSessions();
    await exportWorkoutsToCSV(sessions);
  };

  const handleExportBodyData = async () => {
    if (!hasMeasurements) {
      Alert.alert('Keine Daten', 'Es sind noch keine Körperdaten vorhanden.');
      return;
    }
    const measurements = await getBodyMeasurements();
    await exportBodyDataToCSV(measurements);
  };

  const adjustDashboardLimit = (delta: number) => {
    setDashboardLimit(current => {
      const next = Math.min(DASHBOARD_MAX, Math.max(DASHBOARD_MIN, current + delta));
      if (next !== current) {
        saveDashboardSessionLimit(next);
      }
      return next;
    });
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Einstellungen',
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.backButton}
            accessibilityLabel="Zurück zum Profil"
          >
            <IconSymbol name="arrow.left" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Einstellungen</Text>
          <View style={{ width: 60 }} />
        </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
        ]}
        >
          {Platform.OS !== 'ios' && (
            <Text style={[styles.header, { color: colors.text }]}>Einstellungen</Text>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Darstellung
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    name={isDark ? 'moon.fill' : 'sun.max.fill'}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Dark Mode
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Dunkles Farbschema verwenden
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <IconSymbol
                    name="rectangle.stack"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Dashboard
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Zeige {dashboardLimit} letzte Trainings
                    </Text>
                  </View>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, { borderColor: colors.border }]}
                    onPress={() => adjustDashboardLimit(-1)}
                    disabled={dashboardLimit <= DASHBOARD_MIN}
                  >
                    <IconSymbol
                      name="minus"
                      size={16}
                      color={dashboardLimit <= DASHBOARD_MIN ? colors.textSecondary : colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: colors.text }]}>
                    {dashboardLimit}
                  </Text>
                  <TouchableOpacity
                    style={[styles.counterButton, { borderColor: colors.border }]}
                    onPress={() => adjustDashboardLimit(1)}
                    disabled={dashboardLimit >= DASHBOARD_MAX}
                  >
                    <IconSymbol
                      name="plus"
                      size={16}
                      color={dashboardLimit >= DASHBOARD_MAX ? colors.textSecondary : colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daten exportieren
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleExportWorkouts}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Trainingsdaten exportieren
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Als CSV-Datei exportieren
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleExportBodyData}
              >
                <View style={styles.settingLeft}>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Körperdaten exportieren
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Als CSV-Datei exportieren
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Über die App
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Version
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  1.0.0
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Entwickelt mit
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  React Native & Expo
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
