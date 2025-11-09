
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getWorkoutTemplates, saveWorkoutTemplates } from '@/utils/storage';
import { WorkoutTemplate } from '@/types/workout';

export default function TrainingsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemplates = async () => {
    console.log('Loading templates...');
    const loadedTemplates = await getWorkoutTemplates();
    console.log('Templates loaded:', loadedTemplates.length);
    setTemplates(loadedTemplates);
  };

  // Load templates when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [])
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  const deleteTemplate = (templateId: string) => {
    Alert.alert(
      'Training löschen',
      'Möchtest du dieses Training wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            console.log('Deleting template:', templateId);
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            await saveWorkoutTemplates(updatedTemplates);
            setTemplates(updatedTemplates);
          },
        },
      ]
    );
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Trainings',
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
            <Text style={[styles.header, { color: colors.text, textAlign: 'center' }]}>Trainings</Text>
          )}

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/create-template')}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Neues Training erstellen</Text>
          </TouchableOpacity>

          {templates.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <IconSymbol
                name="figure.strengthtraining.traditional"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Noch keine Trainings vorhanden
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Erstelle dein erstes Training, um loszulegen
              </Text>
            </View>
          ) : (
            <View style={styles.templateList}>
              {templates.map(template => (
                <View key={template.id} style={[styles.card, { backgroundColor: colors.card }]}>
                  <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => router.push(`/edit-template?templateId=${template.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardIcon, { backgroundColor: colors.highlight }]}>
                        <IconSymbol
                          name="figure.strengthtraining.traditional"
                          size={28}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {template.name}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                          {template.exercises.length} Übungen
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => router.push(`/start-workout?templateId=${template.id}`)}
                    >
                      <IconSymbol name="play.fill" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Starten</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                      onPress={() => router.push(`/edit-template?templateId=${template.id}`)}
                    >
                      <IconSymbol name="pencil" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Bearbeiten</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                      onPress={() => deleteTemplate(template.id)}
                    >
                      <IconSymbol name="trash" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  templateList: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
