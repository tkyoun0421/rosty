import { Stack } from 'expo-router';

import { RootProviders } from '@/app/providers/root-providers';

export default function RootLayout() {
  return (
    <RootProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </RootProviders>
  );
}
