import type {
  AuthSession,
  DemoAuthPreset,
  UserRole,
} from '@/features/auth/model/auth-types';

export const authRoutes = {
  login: '/login',
  profileSetup: '/profile-setup',
  approvalWaiting: '/approval-waiting',
  suspended: '/suspended',
  notifications: '/notifications',
  globalSearch: '/search',
  scheduleList: '/schedules',
  scheduleDetail: '/schedule-detail',
  scheduleEdit: '/schedule-edit',
  availabilityOverview: '/availability-overview',
  assignmentWorkspace: '/assignment-workspace',
  workTime: '/work-time',
  employeeHome: '/employee-home',
  myAssignments: '/my-assignments',
  assignmentDetail: '/assignment-detail',
  managerHome: '/manager-home',
  cancellationQueue: '/cancellation-queue',
  myPayroll: '/my-payroll',
  teamPayroll: '/team-payroll',
  members: '/members',
  invitation: '/invitation',
  payPolicy: '/pay-policy',
} as const;

export type AppRoute = (typeof authRoutes)[keyof typeof authRoutes];

const demoSessions: Record<DemoAuthPreset, AuthSession> = {
  'employee-new': {
    userId: 'demo-employee-new',
    displayName: 'Mina Staff',
    role: 'employee',
    status: 'profile_incomplete',
  },
  'employee-pending': {
    userId: 'demo-employee-pending',
    displayName: 'Sera Staff',
    role: 'employee',
    status: 'pending_approval',
  },
  'employee-active': {
    userId: 'demo-employee-active',
    displayName: 'Hana Staff',
    role: 'employee',
    status: 'active',
  },
  'manager-active': {
    userId: 'demo-manager-active',
    displayName: 'Joon Manager',
    role: 'manager',
    status: 'active',
  },
  'admin-active': {
    userId: 'demo-admin-active',
    displayName: 'Minseok Admin',
    role: 'admin',
    status: 'active',
  },
  'employee-suspended': {
    userId: 'demo-employee-suspended',
    displayName: 'Yujin Staff',
    role: 'employee',
    status: 'suspended',
  },
};

export function createDemoSession(preset: DemoAuthPreset): AuthSession {
  return { ...demoSessions[preset] };
}

export function resolveHomeRoute(role: UserRole): AppRoute {
  return role === 'employee' ? authRoutes.employeeHome : authRoutes.managerHome;
}

export function resolveEntryRoute(session: AuthSession | null): AppRoute {
  if (!session) {
    return authRoutes.login;
  }

  switch (session.status) {
    case 'profile_incomplete':
      return authRoutes.profileSetup;
    case 'pending_approval':
      return authRoutes.approvalWaiting;
    case 'active':
      return resolveHomeRoute(session.role);
    case 'suspended':
      return authRoutes.suspended;
  }
}

export function canAccessRoute(
  session: AuthSession | null,
  route: AppRoute,
): boolean {
  switch (route) {
    case authRoutes.login:
      return session === null;
    case authRoutes.profileSetup:
      return session?.status === 'profile_incomplete';
    case authRoutes.approvalWaiting:
      return session?.status === 'pending_approval';
    case authRoutes.suspended:
      return session?.status === 'suspended';
    case authRoutes.notifications:
    case authRoutes.globalSearch:
    case authRoutes.scheduleList:
    case authRoutes.scheduleDetail:
      return session?.status === 'active';
    case authRoutes.availabilityOverview:
    case authRoutes.scheduleEdit:
    case authRoutes.assignmentWorkspace:
    case authRoutes.workTime:
      return session?.status === 'active' && session.role !== 'employee';
    case authRoutes.employeeHome:
      return session?.status === 'active' && session.role === 'employee';
    case authRoutes.myAssignments:
    case authRoutes.assignmentDetail:
      return session?.status === 'active' && session.role === 'employee';
    case authRoutes.myPayroll:
      return session?.status === 'active' && session.role === 'employee';
    case authRoutes.managerHome:
      return session?.status === 'active' && session.role !== 'employee';
    case authRoutes.cancellationQueue:
    case authRoutes.teamPayroll:
      return session?.status === 'active' && session.role !== 'employee';
    case authRoutes.members:
    case authRoutes.invitation:
    case authRoutes.payPolicy:
      return session?.status === 'active' && session.role === 'admin';
  }
}

export function completeProfileSession(
  session: AuthSession | null,
): AuthSession | null {
  if (!session || session.status !== 'profile_incomplete') {
    return session;
  }

  return {
    ...session,
    status: 'pending_approval',
  };
}

export function approveSession(
  session: AuthSession | null,
): AuthSession | null {
  if (!session || session.status !== 'pending_approval') {
    return session;
  }

  return {
    ...session,
    status: 'active',
  };
}

export function suspendSession(
  session: AuthSession | null,
): AuthSession | null {
  if (!session || session.status !== 'active') {
    return session;
  }

  return {
    ...session,
    status: 'suspended',
  };
}

export function reactivateSession(
  session: AuthSession | null,
): AuthSession | null {
  if (!session || session.status !== 'suspended') {
    return session;
  }

  return {
    ...session,
    status: 'active',
  };
}
