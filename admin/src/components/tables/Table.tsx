import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow, } from "../ui/table";

export interface ColumnDefinition<T> {
  key: keyof T;
  header: string;
  width?: string;
  render?: <K extends keyof T>(value: T[K], row: T, index: number) => ReactNode;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  className?: string;
  loading: boolean;
  skeletonCount: number
}

const ReusableTable = <T,>({ data, columns, className = "", loading, skeletonCount }: ReusableTableProps<T>) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((column, i) => (
                <TableCell key={i + i + i} isHeader className={`px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400 ${column.width ? column.width : ""}`} >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map((_, i) => (
                      <TableCell key={`skeleton-${index}-${i + i + i + i}`} className="px-5 py-4 sm:px-6 text-start" >
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : data.length > 0 ? (
              data.map((item, i) => (
                <TableRow key={i + i + i + i + i}>
                  {columns.map((column, inx) => (
                    <TableCell key={inx + inx + inx + inx + inx} className="px-5 py-4 sm:px-6 text-start text-sm font-normal" >
                      {column.render ? column.render(item[column.key], item, i) : (item as never)[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReusableTable