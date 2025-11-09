import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  getWorkoutSessions,
  getDashboardSessionLimit,
  DEFAULT_DASHBOARD_SESSION_LIMIT,
} from '@/utils/storage';
import { WorkoutSession } from '@/types/workout';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionLimit, setSessionLimit] = useState(DEFAULT_DASHBOARD_SESSION_LIMIT);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    console.log('Loading dashboard data...');
    const [loadedSessions, limit] = await Promise.all([
      getWorkoutSessions(),
      getDashboardSessionLimit(),
    ]);
    console.log('Sessions loaded:', loadedSessions.length);
    setSessions(loadedSessions);
    setSessionLimit(limit);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentSessions = React.useMemo(() => (
    sessions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, sessionLimit)
  ), [sessions, sessionLimit]);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Dashboard',
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Platform.OS !== 'ios' && (
            <Text style={[styles.header, { color: colors.text, textAlign: 'center' }]}>Dashboard</Text>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Letzte Trainings</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Zeige bis zu {sessionLimit} gespeicherte Trainings
            </Text>
            {sessions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Noch keine Trainings absolviert
                </Text>
              </View>
            ) : (
              recentSessions.map(session => (
                <View
                  key={session.id}
                  style={[styles.sessionCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={[styles.sessionTitle, { color: colors.text }]}>
                      {session.templateName}
                    </Text>
                    <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                      {new Date(session.date).toLocaleDateString('de-DE')}
                    </Text>
                  </View>
                  <Text style={[styles.sessionExercises, { color: colors.textSecondary }]}>
                    {session.exercises.length} Uebungen absolviert
                  </Text>
                </View>
              ))
            )}
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sessionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 14,
  },
  sessionExercises: {
    fontSize: 14,
  },
});
