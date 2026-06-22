import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function Table<T>({
  columns,
  rows,
  getRowKey,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th className="border-b border-slate-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400" key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors" key={getRowKey(row)}>
                {columns.map((column) => (
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800" key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
