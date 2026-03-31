"use client";

import { useState } from "react";

import { submitSchedule } from "#mutations/schedule/actions/submitSchedule";

interface RoleSlotDraft {
  id: number;
  roleCode: string;
  headcount: string;
}

export function CreateScheduleForm() {
  const [roleSlots, setRoleSlots] = useState<RoleSlotDraft[]>([
    { id: 1, roleCode: "captain", headcount: "2" },
  ]);

  return (
    <form action={submitSchedule}>
      <fieldset>
        <legend>새 스케줄 생성</legend>
        <label>
          근무일
          <input name="date" type="date" required />
        </label>
        <label>
          시작 시간
          <input name="startTime" type="time" required />
        </label>
        <label>
          종료 시간
          <input name="endTime" type="time" required />
        </label>
      </fieldset>

      <fieldset>
        <legend>역할별 모집 인원</legend>
        {roleSlots.map((roleSlot, index) => (
          <div key={roleSlot.id}>
            <label>
              역할 코드
              <input
                name="roleCode"
                value={roleSlot.roleCode}
                onChange={(event) => {
                  const nextRoleCode = event.target.value;
                  setRoleSlots((current) =>
                    current.map((item) =>
                      item.id === roleSlot.id ? { ...item, roleCode: nextRoleCode } : item,
                    ),
                  );
                }}
                required
              />
            </label>
            <label>
              인원
              <input
                name="headcount"
                type="number"
                min={1}
                step={1}
                value={roleSlot.headcount}
                onChange={(event) => {
                  const nextHeadcount = event.target.value;
                  setRoleSlots((current) =>
                    current.map((item) =>
                      item.id === roleSlot.id ? { ...item, headcount: nextHeadcount } : item,
                    ),
                  );
                }}
                required
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setRoleSlots((current) =>
                  current.length === 1 ? current : current.filter((item) => item.id !== roleSlot.id),
                );
              }}
              disabled={roleSlots.length === 1}
            >
              행 삭제
            </button>
            <span>역할 {index + 1}</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setRoleSlots((current) => [...current, { id: Date.now(), roleCode: "", headcount: "1" }]);
          }}
        >
          역할 추가
        </button>
      </fieldset>

      <button type="submit">스케줄 저장</button>
    </form>
  );
}
