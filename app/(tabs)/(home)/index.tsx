
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getWorkoutTemplates, getWorkoutSessions } from '@/utils/storage';
import { WorkoutTemplate, WorkoutSession } from '@/types/workout';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    console.log('Loading dashboard data...');
    const loadedTemplates = await getWorkoutTemplates();
    const loadedSessions = await getWorkoutSessions();
    console.log('Templates loaded:', loadedTemplates.length);
    console.log('Sessions loaded:', loadedSessions.length);
    setTemplates(loadedTemplates);
    setSessions(loadedSessions);
  };

  // Load data when screen comes into focus
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

  const getLastWorkoutDate = (templateId: string): string => {
    const templateSessions = sessions
      .filter(s => s.templateId === templateId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (templateSessions.length > 0) {
      return new Date(templateSessions[0].date).toLocaleDateString('de-DE');
    }
    return 'Noch nie';
  };

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
        contentContainerStyle={[
          styles.scrollContent,
        ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Platform.OS !== 'ios' && (
            <Text style={[styles.header, { color: colors.text,  textAlign: 'center' }]}>Dashboard</Text>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Meine Trainings
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/create-template')}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <IconSymbol name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {templates.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <IconSymbol
                  name="figure.strengthtraining.traditional"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Noch keine Trainings vorhanden
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Erstelle dein erstes Training mit dem + Button
                </Text>
              </View>
            ) : (
              templates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.card, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/start-workout?templateId=${template.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <IconSymbol
                        name="figure.strengthtraining.traditional"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {template.name}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {template.exercises.length} Übungen
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                      Letztes Training: {getLastWorkoutDate(template.id)}
                    </Text>
                    <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Letzte Trainings
            </Text>
            {sessions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Noch keine Trainings absolviert
                </Text>
              </View>
            ) : (
              sessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(session => (
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
                      {session.exercises.length} Übungen absolviert
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 14,
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
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
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
