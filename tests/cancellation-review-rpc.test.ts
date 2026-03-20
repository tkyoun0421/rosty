declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('cancellation review rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320140000_cancellation_review_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the review rpc and restricts it to manager/admin reviewers', () => {
    expect(migration).toContain(
      'create or replace function public.review_cancellation_request',
    );
    expect(migration).toContain(
      'Only active managers or admins can review cancellation requests.',
    );
  });

  it('synchronizes request and assignment status for approve/reject actions', () => {
    expect(migration).toContain(
      "when 'approve' then 'approved'::public.cancellation_request_status",
    );
    expect(migration).toContain(
      "when 'approve' then 'cancelled'::public.assignment_status",
    );
    expect(migration).toContain(
      "else 'rejected'::public.cancellation_request_status",
    );
    expect(migration).toContain(
      "else 'confirmed'::public.assignment_status",
    );
  });
});
