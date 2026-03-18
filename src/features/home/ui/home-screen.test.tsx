import type { ReactElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import { createDemoSession } from '@/features/auth/model/auth-rules';

import { EmployeeHomeScreen, ManagerHomeScreen } from '@/features/home/ui/home-screen';

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('role home screens', () => {
  it('renders employee priorities from the dashboard query', async () => {
    renderWithQuery(<EmployeeHomeScreen session={createDemoSession('employee-active')} />);

    expect(await screen.findByText('Upcoming assignments')).toBeTruthy();
    expect(screen.getAllByText('Laviebel Grand Hall')).toHaveLength(2);
    expect(screen.getByText('Open schedules')).toBeTruthy();
  });

  it('renders manager operations and quick actions from the dashboard query', async () => {
    renderWithQuery(<ManagerHomeScreen session={createDemoSession('manager-active')} />);

    expect(await screen.findByText('Operations queue')).toBeTruthy();
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('Create schedule')).toBeTruthy();
  });
});


