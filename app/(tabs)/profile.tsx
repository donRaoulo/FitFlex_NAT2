import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
        ]} glassEffectStyle="regular">
          <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          <Text style={[styles.name, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>john.doe@example.com</Text>
        </GlassView>

        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
        ]} glassEffectStyle="regular">
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>San Francisco, CA</Text>
          </View>
        </GlassView>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings')}
          style={[
            styles.settingsButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.settingsButtonContent}>
            <IconSymbol name="gear" size={22} color={colors.text} />
            <View style={styles.settingsTextGroup}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>
                Einstellungen
              </Text>
              <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
                Profil & App anpassen
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor handled dynamically
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    // color handled dynamically
  },
  email: {
    fontSize: 16,
    // color handled dynamically
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    // color handled dynamically
  },
  settingsButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsTextGroup: {
    flexDirection: 'column',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSubtitle: {
    fontSize: 13,
  },
});
