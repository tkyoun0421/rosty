# Roadmap: ��񿡺� ����Ȧ �ٹ��� ���� �� ��

## Overview

�� ������Ʈ�� ����Ȧ �ٹ� � �帧�� ������ȭ�� �����ڿ� �ٹ��ڰ� ���� ������ �ŷ��� �� �ְ� ����� v1 ���� � ������. Phase 1������ ������ ����, �ñ� ���� ����� �������, ���� ������ �Խ�, ��û, ����, ���� �޿�, ��� üũ, � ��ú��� ������ Ȯ���Ѵ�.

## Phases

- [x] **Phase 1: Access Foundation**
- [ ] **Phase 2: Schedule Publishing**
- [ ] **Phase 3: Assignment And Pay Preview**
- [ ] **Phase 4: Attendance Check-In**
- [ ] **Phase 5: Operations Dashboard**

## Phase Details

### Phase 1: Access Foundation
**Goal**: ���� �η� ����, ������/�ٹ��� ���� �и�, �ʴ� ��� �º���, ������ �ñ� ���� ��� ����
**Depends on**: Nothing
**Requirements**: AUTH-01, AUTH-02, AUTH-03, PAY-01
**Success Criteria**:
1. �����ڴ� �ʴ� ������� �ٹ��� ������ �����ϰų� �ʴ� ��ũ�� �߱��� �� �ִ�.
2. ����ڴ� Google �α����� ���� ���� �� �α����� �� �ִ�.
3. �����ڿ� �ٹ��ڴ� ���ҿ� ���� ���� ������ ���еȴ�.
4. �����ڴ� �ٹ��ں� �ñ��� ����ϰ� ������ �� �ִ�.
**Plans**: 4
**Status**: Complete

### Phase 2: Schedule Publishing
**Goal**: �����ڰ� �������� �Խ��ϰ� �ٹ��ڰ� ���� ���� �������� ���� ��û�� �� �ְ� �Ѵ�.
**Depends on**: Phase 1
**Requirements**: SCHD-01, SCHD-02, SCHD-03, APPL-01, APPL-02
**Success Criteria**:
1. �����ڴ� ��¥, ���� �ð�, ���� �ð�, ���Һ� ���� �ο��� ������ �ٹ� �������� ������ �� �ִ�.
2. �����ڴ� ������ ���¸� ���� ��, ���� ��, Ȯ�� �Ϸ�� ��� �� �ִ�.
3. �ٹ��ڴ� ���� ���� �ٹ� ������ ����� Ȯ���� �� �ִ�.
4. �ٹ��ڴ� Ư�� �����ٿ� �ٹ� ��û�� ������ �� �ִ�.
**Plans**: 3
Plans:
- [ ] 02-01-PLAN.md - Minimal schedule persistence, atomic admin creation path, and create-first admin route
- [ ] 02-02-PLAN.md - Admin schedule listing and lightweight status management
- [ ] 02-03-PLAN.md - Worker recruiting list and one-application-per-schedule submit flow
**Status**: Context gathered, planning next

### Phase 3: Assignment And Pay Preview
**Goal**: ��û ����, ���Һ� ����, ���� Ȯ��, ���� �޿� ���� �ٹ��� Ȯ�� �帧 ����
**Depends on**: Phase 2
**Requirements**: APPL-03, ASGN-01, ASGN-02, ASGN-03, PAY-02, PAY-03, PAY-04
**Plans**: 3
**Status**: Pending

### Phase 4: Attendance Check-In
**Goal**: ��ġ ��� ��� üũ ����� ������ ��� ���� Ȯ�� �帧 ����
**Depends on**: Phase 3
**Requirements**: ATTD-01, ATTD-02, ATTD-03
**Plans**: 2
**Status**: Pending

### Phase 5: Operations Dashboard
**Goal**: ���� �� ���� �ٹ�, �̻� ¡��, ����/��� ��Ȳ�� �� ȭ�鿡�� Ȯ���ϴ� ������ ��ú��� ����
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03
**Plans**: 2
**Status**: Pending

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Access Foundation | 4/4 | Complete | 2026-03-31 |
| 2. Schedule Publishing | 0/3 | Context gathered | - |
| 3. Assignment And Pay Preview | 0/3 | Not started | - |
| 4. Attendance Check-In | 0/2 | Not started | - |
| 5. Operations Dashboard | 0/2 | Not started | - |

---
*Last updated: 2026-03-31 after Phase 1 completion and Phase 2 discussion*
