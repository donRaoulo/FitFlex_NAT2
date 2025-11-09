import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors as appColors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 32,
  borderRadius = 24,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)/(home)/') {
      return pathname === '/' || pathname.startsWith('/(tabs)/(home)');
    }
    return pathname.includes(route.replace('/(tabs)/', ''));
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.container,
        {
          bottom: bottomMargin,
          width: containerWidth,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'android' ? 80 : 100}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            borderRadius,
            backgroundColor: Platform.OS === 'android' 
              ? 'transparent' 
              : theme.dark 
                ? 'rgba(30, 30, 30, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
          },
        ]}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
<Ionicons
  name={tab.icon}
  size={24}
  color={active ? appColors.primary : appColors.text}
/>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: active ? appColors.primary : appColors.text,
                      fontWeight: active ? '500' : '300',
                    },
                  ]}
                >
                  {active? tab.label : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    boxShadow: '0px 4px 12px rgba(66, 67, 66, 0.92)',
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
