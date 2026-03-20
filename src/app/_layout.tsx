import { Stack } from 'expo-router';

import { RootProviders } from '@/shared/providers/root-providers';

export default function RootLayout() {
  return (
    <RootProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </RootProviders>
  );
}
