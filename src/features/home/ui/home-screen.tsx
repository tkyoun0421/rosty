import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { publicEnv } from '@/shared/config/env';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

const setupCards = [
  {
    title: 'Expo Router',
    body: 'Managed workflow, typed routes, and a single app repository are ready.',
  },
  {
    title: 'Supabase baseline',
    body: hasSupabaseConfig
      ? 'Public Supabase keys were detected for local development.'
      : 'Add your public Supabase keys to start backend integration.',
  },
  {
    title: 'Verification',
    body: 'Lint, typecheck, unit test, build, and Detox entry points are wired.',
  },
];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{publicEnv.appEnv.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>Rosty</Text>
          <Text style={styles.subtitle}>Wedding hall operations cockpit</Text>
          <Text style={styles.description}>
            Fresh Expo Router workspace for staffing, scheduling, payroll estimation, and operator tools.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Boot checklist</Text>
          {setupCards.map((card) => {
            return (
              <View key={card.title} style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardBody}>{card.body}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Next moves</Text>
          <Text style={styles.listItem}>1. Fill `.env` from `.env.example`.</Text>
          <Text style={styles.listItem}>2. Connect Supabase project and OAuth providers.</Text>
          <Text style={styles.listItem}>3. Prebuild native projects when EAS or Detox native flows begin.</Text>
        </View>

        <Pressable accessibilityLabel="Open setup checklist" accessibilityRole="button" style={styles.cta}>
          <Text style={styles.ctaText}>Setup scaffold ready</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6efe5',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  hero: {
    backgroundColor: '#14342b',
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f4bb65',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: '#fff8ef',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: '#f4bb65',
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: '#d7d4ce',
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    backgroundColor: '#fff8ef',
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  sectionTitle: {
    color: '#14342b',
    fontSize: 18,
    fontWeight: '800',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#f0e2cf',
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    color: '#4f5a55',
    fontSize: 14,
    lineHeight: 20,
  },
  listItem: {
    color: '#4f5a55',
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    borderRadius: 999,
    backgroundColor: '#7a2e1f',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff8ef',
    fontSize: 16,
    fontWeight: '700',
  },
});
