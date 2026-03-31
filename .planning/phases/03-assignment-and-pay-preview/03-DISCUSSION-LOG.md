# Phase 3: Assignment And Pay Preview - Discussion Log

> Audit trail only. Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md.

**Date:** 2026-03-31
**Phase:** 03-assignment-and-pay-preview
**Areas discussed:** applicant review, assignment unit, confirmation rule, pay preview

---

## Applicant Review

| Option | Description | Selected |
|--------|-------------|----------|
| 스케줄 상세형 | 스케줄 하나를 열면 신청자 목록과 상태를 그 안에서 검토 | yes |
| 스케줄 목록 확장형 | 목록에서 일부 신청자를 펼쳐서 확인 | |
| 별도 신청함형 | 검토를 스케줄 화면과 분리된 별도 화면에서 처리 | |

**User's choice:** 스케줄 상세형
**Notes:** 신청 검토는 스케줄 중심 흐름 안에서 처리한다.

---

## Assignment Unit

| Option | Description | Selected |
|--------|-------------|----------|
| 역할 슬롯별 배정 | 각 역할 슬롯에 몇 명을 넣을지 기준으로 배정 | yes |
| 스케줄 전체 배정 | 역할 없이 스케줄 참여 인원만 확정 | |
| 혼합형 | 역할 슬롯별과 역할 없는 확정을 같이 허용 | |

**User's choice:** 역할 슬롯별 배정
**Notes:** 신청은 스케줄 단위지만 실제 확정은 역할 슬롯별로 수행한다.

---

## Confirmation Rule

| Option | Description | Selected |
|--------|-------------|----------|
| 명시적 확정 | 배정 저장과 최종 확정을 분리하고 마지막에 확정 버튼으로 반영 | yes |
| 배정 저장 즉시 확정 | 저장되는 순간 최종 확정 처리 | |
| 자동 확정 조건형 | 일정 조건 충족 시 자동 확정 | |

**User's choice:** 명시적 확정
**Notes:** 운영 실수 방지를 위해 draft 저장과 최종 확정을 분리한다.

---

## Pay Preview

| Option | Description | Selected |
|--------|-------------|----------|
| 총액 + 계산 근거 | 총 예상 급여와 계산 기준을 함께 표시 | yes |
| 총액만 | 숫자만 보여주고 계산 근거는 숨김 | |
| 상세 분해형 | 기본분, 연장분 등 더 세세하게 분해해서 표시 | |

**User's choice:** 총액 + 계산 근거
**Notes:** 근무 시간, 시급, 연장 계산 반영 여부를 함께 확인 가능해야 한다.

---

## the agent's Discretion

- 신청자 상태 라벨 naming
- 배정 편집 UI의 상세 interaction
- pay preview density와 wording

## Deferred Ideas

- 자동 확정 조건형 워크플로
- 역할 없는 스케줄 전체 확정 모델
- 출근 데이터 연동 급여 보정
- 운영 알림/통지 기능