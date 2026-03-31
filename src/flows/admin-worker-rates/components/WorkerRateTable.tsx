import type { WorkerRateRecord } from "#shared/model/access";

export function WorkerRateTable({ records }: { records: WorkerRateRecord[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>근무자</th>
          <th>현재 시급</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.userId}>
            <td>{record.userId}</td>
            <td>{record.hourlyRateCents}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
