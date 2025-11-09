import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/contexts/ThemeContext';

type TabBarItem = {
  name: string;
  route: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

const tabs: TabBarItem[] = [
  { name: '(home)', route: '/(tabs)/(home)/', icon: 'home-outline', label: 'Dashboard' },
  { name: 'trainings', route: '/(tabs)/trainings', icon: 'barbell-outline', label: 'Trainings' },
  { name: 'bodydata', route: '/(tabs)/bodydata', icon: 'body-outline', label: 'Body' },
  { name: 'profile', route: '/(tabs)/profile', icon: 'finger-print-outline', label: 'Profile' },
];

const normalizeForMatch = (value: string) => {
  if (!value) {
    return '/';
  }
  let result = value;
  result = result.replace(/\/+$/, '');
  result = result.replace(/^\/\(tabs\)/, '');
  if (result === '' || result === '/') {
    return '/';
  }
  if (result.startsWith('/(home)')) {
    return '/';
  }
  return result.startsWith('/') ? result : `/${result}`;
};

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();

  const activeRoute = useMemo(() => {
    const normalizedPath = normalizeForMatch(pathname);
    if (normalizedPath === '/') {
      return '/(tabs)/(home)/';
    }

    const matched = tabs.find((tab) => {
      const normalizedRoute = normalizeForMatch(tab.route);
      if (normalizedRoute === '/') {
        return normalizedPath === '/';
      }
      return (
        normalizedPath === normalizedRoute ||
        normalizedPath.startsWith(`${normalizedRoute}/`)
      );
    });

    return matched?.route ?? '/(tabs)/(home)/';
  }, [pathname]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newRoute: string) => {
      if (newRoute !== activeRoute) {
        router.push(newRoute as any);
      }
    },
    [router, activeRoute],
  );

  return (
    <View style={[styles.layout, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(home)" />
          <Stack.Screen name="trainings" />
          <Stack.Screen name="bodydata" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
      <SafeAreaView
        edges={['bottom']}
        style={[
          styles.navContainer,
          {
            borderTopColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            backgroundColor: colors.card,
          },
        ]}
      >
        <BottomNavigation
          value={activeRoute}
          onChange={handleTabChange}
          showLabels
          sx={{
            width: '100%',
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
            },
          }}
        >
          {tabs.map((tab) => {
            const selected = activeRoute === tab.route;
            return (
              <BottomNavigationAction
                key={tab.route}
                label={tab.label}
                value={tab.route}
                icon={
                  <Ionicons
                    name={tab.icon}
                    size={22}
                    color={selected ? colors.primary : colors.textSecondary}
                  />
                }
                sx={{
                  color: selected ? colors.primary : colors.textSecondary,
                  '& .MuiBottomNavigationAction-label': {
                    opacity: selected ? 1 : 0,
                    fontWeight: 600,
                    color: selected ? colors.primary : colors.textSecondary,
                  },
                }}
              />
            );
          })}
        </BottomNavigation>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1 },
  content: { flex: 1 },
  navContainer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
