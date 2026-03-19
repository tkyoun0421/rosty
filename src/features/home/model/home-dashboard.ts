import { useQuery } from '@tanstack/react-query';

import type { UserRole } from '@/features/auth/model/auth-types';

type DashboardCard = {
  title: string;
  subtitle: string;
  meta: string;
};

type QuickAction = {
  title: string;
  detail: string;
};

export type EmployeeDashboard = {
  kind: 'employee';
  headline: string;
  upcomingAssignments: DashboardCard[];
  openSchedules: DashboardCard[];
};

export type ManagerDashboard = {
  kind: 'manager';
  headline: string;
  operationsQueue: DashboardCard[];
  quickActions: QuickAction[];
  weekSchedule: DashboardCard[];
};

export type HomeDashboard = EmployeeDashboard | ManagerDashboard;

const homeDashboardSeed: Record<UserRole, HomeDashboard> = {
  employee: {
    kind: 'employee',
    headline: 'See upcoming assignments and open schedules in one place.',
    upcomingAssignments: [
      {
        title: 'Laviebel Grand Hall',
        subtitle: 'March 23 - Banquet service',
        meta: 'Starts 1:00 PM',
      },
      {
        title: 'Laviebel Garden Hall',
        subtitle: 'March 29 - Bride room support',
        meta: 'Starts 11:30 AM',
      },
    ],
    openSchedules: [
      {
        title: 'Laviebel Convention Hall',
        subtitle: 'April 2 - Response window still open',
        meta: 'Response: not submitted',
      },
      {
        title: 'Laviebel Grand Hall',
        subtitle: 'April 5 - Extra staffing still open',
        meta: 'Response: available',
      },
    ],
  },
  manager: {
    kind: 'manager',
    headline: 'Sort today around the operating queue and the next actions.',
    operationsQueue: [
      {
        title: '2 cancellation requests',
        subtitle: 'Confirmed assignments waiting for review today',
        meta: 'High priority',
      },
      {
        title: '4 unanswered slots',
        subtitle: 'Availability overview needs review',
        meta: 'Vacancy risk',
      },
      {
        title: '1 missing time record',
        subtitle: 'Past event payroll is waiting',
        meta: 'Record actual work time',
      },
    ],
    quickActions: [
      {
        title: 'Create schedule',
        detail: 'Open a new event from the standard slot preset.',
      },
      {
        title: 'Review cancellation queue',
        detail: 'Approve or reject pending cancellation requests.',
      },
      {
        title: 'Record work time',
        detail: 'Capture actual start and end times after the event.',
      },
    ],
    weekSchedule: [
      {
        title: 'March 23 Grand Hall wedding',
        subtitle: 'Assignments confirmed',
        meta: '8 slots - 0 vacancies',
      },
      {
        title: 'March 29 Garden Hall reception',
        subtitle: 'Availability still open',
        meta: 'Responses 6/10',
      },
    ],
  },
  admin: {
    kind: 'manager',
    headline: 'See operations and admin support actions in one dashboard.',
    operationsQueue: [
      {
        title: '3 users waiting for approval',
        subtitle: 'Members screen needs review',
        meta: 'Admin only',
      },
      {
        title: '2 cancellation requests',
        subtitle: 'Confirmed assignments waiting for review today',
        meta: 'High priority',
      },
      {
        title: '1 pay-policy review',
        subtitle: 'Check before the next payroll estimate',
        meta: 'Pay Policy',
      },
    ],
    quickActions: [
      {
        title: 'Approve members',
        detail: 'Review pending users and role changes.',
      },
      {
        title: 'Issue invite link',
        detail: 'Create or reissue employee invite links.',
      },
      {
        title: 'Review pay policy',
        detail: 'Adjust default hourly rates and member overrides.',
      },
    ],
    weekSchedule: [
      {
        title: 'March 23 Grand Hall wedding',
        subtitle: 'Assignments confirmed',
        meta: '8 slots - 0 vacancies',
      },
      {
        title: 'March 29 Garden Hall reception',
        subtitle: 'Availability still open',
        meta: 'Responses 6/10',
      },
    ],
  },
};

export async function fetchHomeDashboard(
  role: UserRole,
): Promise<HomeDashboard> {
  await Promise.resolve();

  const dashboard = homeDashboardSeed[role];

  if (dashboard.kind === 'employee') {
    return {
      ...dashboard,
      upcomingAssignments: dashboard.upcomingAssignments.map((card) => ({
        ...card,
      })),
      openSchedules: dashboard.openSchedules.map((card) => ({ ...card })),
    };
  }

  return {
    ...dashboard,
    operationsQueue: dashboard.operationsQueue.map((card) => ({ ...card })),
    quickActions: dashboard.quickActions.map((action) => ({ ...action })),
    weekSchedule: dashboard.weekSchedule.map((card) => ({ ...card })),
  };
}

export function useHomeDashboardQuery(role: UserRole) {
  return useQuery({
    queryKey: ['home-dashboard', role],
    queryFn: () => fetchHomeDashboard(role),
    staleTime: 30_000,
  });
}
