import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

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
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-slate-200 px-4 py-3 text-xs font-black uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400" key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="dark:bg-slate-950">
            {rows.map((row) => (
              <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800" key={getRowKey(row)}>
                {columns.map((column) => (
                  <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300" key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
