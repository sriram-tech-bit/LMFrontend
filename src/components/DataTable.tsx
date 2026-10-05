import type { ReactNode } from 'react';

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string; _id?: string }> {
  columns: DataColumn<T>[];
  rows: T[];
  emptyMessage: string;
}

export function DataTable<T extends { id: string; _id?: string }>({
  columns,
  rows,
  emptyMessage,
}: DataTableProps<T>) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>{columns.map((column) => <th className={column.className} key={column.key}>{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="table-empty" colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={row.id || row._id || index}>
              {columns.map((column) => <td className={column.className} key={column.key}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
