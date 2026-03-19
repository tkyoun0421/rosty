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
    expect(canAccessRoute(null, authRoutes.employeeHome)).toBe(false);
    expect(canAccessRoute(null, authRoutes.managerHome)).toBe(false);
    expect(canAccessRoute(null, authRoutes.members)).toBe(false);
    expect(canAccessRoute(null, authRoutes.invitation)).toBe(false);
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
  });

  it('separates employee and manager home access', () => {
    expect(
      canAccessRoute(
        createDemoSession('employee-active'),
        authRoutes.employeeHome,
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
        authRoutes.managerHome,
      ),
    ).toBe(true);
  });

  it('allows members and invitation only for active admins', () => {
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.members),
    ).toBe(true);
    expect(
      canAccessRoute(createDemoSession('admin-active'), authRoutes.invitation),
    ).toBe(true);
    expect(
      canAccessRoute(createDemoSession('manager-active'), authRoutes.members),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('manager-active'), authRoutes.invitation),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('employee-active'), authRoutes.members),
    ).toBe(false);
    expect(
      canAccessRoute(createDemoSession('employee-active'), authRoutes.invitation),
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
