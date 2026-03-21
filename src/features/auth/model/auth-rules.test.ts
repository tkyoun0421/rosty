import {
  approveSession,
  authRoutes,
  canAccessRoute,
  completeProfileSession,
  createDemoSession,
  reactivateSession,
  resolveEntryRoute,
  suspendSession,
} from '@/features/auth/model/auth-rules';

describe('auth route resolution', () => {
  it('sends signed-out users to login', () => {
    expect(resolveEntryRoute(null)).toBe(authRoutes.login);
  });

  it('sends profile-incomplete users to profile setup', () => {
    expect(resolveEntryRoute(createDemoSession('employee-new'))).toBe(
      authRoutes.profileSetup,
    );
  });

  it('sends pending users to approval waiting', () => {
    expect(resolveEntryRoute(createDemoSession('employee-pending'))).toBe(
      authRoutes.approvalWaiting,
    );
  });

  it('sends active employees to employee home', () => {
    expect(resolveEntryRoute(createDemoSession('employee-active'))).toBe(
      authRoutes.employeeHome,
    );
  });

  it('sends active managers and admins to manager home', () => {
    expect(resolveEntryRoute(createDemoSession('manager-active'))).toBe(
      authRoutes.managerHome,
    );
    expect(resolveEntryRoute(createDemoSession('admin-active'))).toBe(
      authRoutes.managerHome,
    );
  });
});

describe('auth route access', () => {
  it('blocks signed-out users from protected routes', () => {
    expect(canAccessRoute(null, authRoutes.notifications)).toBe(false);
    expect(canAccessRoute(null, authRoutes.scheduleList)).toBe(false);
    expect(canAccessRoute(null, authRoutes.scheduleDetail)).toBe(false);
    expect(canAccessRoute(null, authRoutes.scheduleEdit)).toBe(false);
    expect(canAccessRoute(null, authRoutes.availabilityOverview)).toBe(false);
    expect(canAccessRoute(null, authRoutes.assignmentWorkspace)).toBe(false);
    expect(canAccessRoute(null, authRoutes.workTime)).toBe(false);
    expect(canAccessRoute(null, authRoutes.employeeHome)).toBe(false);
    expect(canAccessRoute(null, authRoutes.myAssignments)).toBe(false);
    expect(canAccessRoute(null, authRoutes.assignmentDetail)).toBe(false);
    expect(canAccessRoute(null, authRoutes.myPayroll)).toBe(false);
    expect(canAccessRoute(null, authRoutes.managerHome)).toBe(false);
    expect(canAccessRoute(null, authRoutes.cancellationQueue)).toBe(false);
    expect(canAccessRoute(null, authRoutes.teamPayroll)).toBe(false);
    expect(canAccessRoute(null, authRoutes.members)).toBe(false);
    expect(canAccessRoute(null, authRoutes.invitation)).toBe(false);
    expect(canAccessRoute(null, authRoutes.payPolicy)).toBe(false);
  });

  it('allows only the matching status screen', () => {
    expect(
      canAccessRoute(
        createDemoSession('employee-new'),
        authRoutes.profileSetup,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-new'),
        authRoutes.approvalWaiting,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-pending'),
        authRoutes.approvalWaiting,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.suspended,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.notifications,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.scheduleList,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.scheduleEdit,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.availabilityOverview,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.assignmentWorkspace,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-suspended'),
        authRoutes.workTime,
      ),
    ).toBe(false);
  });

  it('separates employee and manager home access', () => {
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.notifications,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.scheduleList,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.scheduleDetail,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.scheduleEdit,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.availabilityOverview,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.assignmentWorkspace,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.workTime,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.employeeHome,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.myAssignments,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.assignmentDetail,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.myPayroll,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.managerHome,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.notifications,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.scheduleList,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.scheduleDetail,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.scheduleEdit,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.availabilityOverview,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.assignmentWorkspace,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.workTime,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.myAssignments,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.assignmentDetail,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.myPayroll,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.managerHome,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.cancellationQueue,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('manager-active'),
        authRoutes.teamPayroll,
      ),
    ).toBe(true);
  });

  it('allows admin-only routes only for active admins', () => {
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.teamPayroll),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('admin-active'),
        authRoutes.cancellationQueue,
      ),
    ).toBe(true);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.cancellationQueue,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.teamPayroll,
      ),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.members),
    ).toBe(true);
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.invitation),
    ).toBe(true);
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.payPolicy),
    ).toBe(true);
    expect(
      canAccessRoute(createDemoSession('manager-active'), authRoutes.members),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('manager-active'), authRoutes.invitation),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('manager-active'), authRoutes.payPolicy),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('employee-active'), authRoutes.members),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('employee-active'), authRoutes.invitation),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('employee-active'), authRoutes.payPolicy),
    ).toBe(false);
  });
});

describe('auth transitions', () => {
  it('moves a profile-incomplete user to pending approval', () => {
    expect(
      completeProfileSession(createDemoSession('employee-new'))?.status,
    ).toBe('pending_approval');
  });

  it('moves a pending user to active when approved', () => {
    expect(approveSession(createDemoSession('employee-pending'))?.status).toBe(
      'active',
    );
  });

  it('moves an active user to suspended and back to active', () => {
    const suspended = suspendSession(createDemoSession('employee-active'));

    expect(suspended?.status).toBe('suspended');
    expect(reactivateSession(suspended)?.status).toBe('active');
  });
});
