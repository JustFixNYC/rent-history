import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  RowData,
} from "@tanstack/react-table";
import React, { ChangeEvent } from "react";

import "./EditableTable.scss";
import {
  makeData,
  Lease,
  LEASE_REASONS_CHANGE,
  LEASE_APT_STAT,
} from "./sampleData";

// Helper to create sample pages with variable row counts
const makePages = (rowCounts: number[]): Lease[][] => {
  return rowCounts.map((count) => makeData(count));
};

const emptyLease = (): Lease => ({
  regYear: "",
  aptStat: LEASE_APT_STAT[0],
  filingDate: "",
  legalRent: 0,
  prefRent: 0,
  paidRent: 0,
  reasonsChange: "",
  leaseStart: "",
  leaseEnd: "",
});

type Option = { value: string; label: string };

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    type: string; // TODO: add list of valid types
    options?: Option[];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    addRow: (rowIndex?: number) => void;
    removeRow: (rowIndex: number) => void;
  }
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<Lease>> = {
  cell: function Cell({ getValue, row: { index }, column, table }) {
    const tableMeta = table.options.meta;
    const {
      id,
      columnDef: { meta: columnMeta },
    } = column;

    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      tableMeta?.updateData(index, id, value);
    };

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setValue(e.target.value);
      tableMeta?.updateData(index, id, e.target.value);
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (columnMeta?.type === "select") {
      return (
        <select
          name={id}
          onChange={onSelectChange}
          value={initialValue as string}
        >
          {columnMeta?.options?.map((option: Option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else if (columnMeta?.type === "date") {
      console.log(value);
      return (
        <input
          name={id}
          type="date"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    } else {
      return (
        <input
          name={id}
          type={columnMeta?.type || "text"}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    }
  },
};

export const EditableTable: React.FC = () => {
  const columns = React.useMemo<ColumnDef<Lease>[]>(
    () => [
      {
        accessorKey: "regYear",
        header: "Reg Year",
        meta: { type: "number" },
      },
      {
        accessorKey: "aptStat",
        header: "Apt Stat",
        meta: {
          type: "select",
          options: LEASE_APT_STAT.map((value) => ({ value, label: value })),
        },
      },
      {
        accessorKey: "filingDate",
        header: "Filing Date",
        meta: { type: "date" },
      },
      {
        accessorKey: "legalRent",
        header: "Legal Regulated Rent",
        meta: { type: "number" },
      },
      {
        accessorKey: "prefRent",
        header: "Prefer. Rent",
        meta: { type: "number" },
      },
      {
        accessorKey: "paidRent",
        header: "Actual Paid Rent",
        meta: { type: "number" },
      },
      {
        accessorKey: "reasonsChange",
        header: "Reasons Differ. / Change",
        meta: {
          type: "select",
          options: LEASE_REASONS_CHANGE.map((value) => ({
            value,
            label: value,
          })),
        },
      },
      {
        accessorKey: "leaseStart",
        header: "Lease Began",
        meta: { type: "date" },
      },
      {
        accessorKey: "leaseEnd",
        header: "Lease Ends",
        meta: { type: "date" },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => (
          <div className="row-actions">
            <button
              type="button"
              className="btn-add"
              onClick={() => table.options.meta?.addRow(row.index)}
              title="Add row below"
            >
              +
            </button>
            <button
              type="button"
              className="btn-remove"
              onClick={() => table.options.meta?.removeRow(row.index)}
              title="Remove row"
            >
              ×
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Sample pages with variable row counts (e.g., 11 rows, 8 rows, 10 rows)
  const [pages, setPages] = React.useState(() => makePages([11, 8, 10]));
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);

  const currentPageData = pages[currentPageIndex] || [];
  const totalPages = pages.length;

  const table = useReactTable({
    data: currentPageData,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setPages((oldPages) =>
          oldPages.map((page, pageIdx) => {
            if (pageIdx === currentPageIndex) {
              return page.map((row, idx) => {
                if (idx === rowIndex) {
                  return { ...row, [columnId]: value };
                }
                return row;
              });
            }
            return page;
          })
        );
      },
      addRow: (rowIndex?: number) => {
        const newRow = emptyLease();
        setPages((oldPages) =>
          oldPages.map((page, pageIdx) => {
            if (pageIdx === currentPageIndex) {
              if (rowIndex === undefined) {
                return [...page, newRow];
              }
              const newPage = [...page];
              newPage.splice(rowIndex + 1, 0, newRow);
              return newPage;
            }
            return page;
          })
        );
      },
      removeRow: (rowIndex: number) => {
        setPages((oldPages) =>
          oldPages.map((page, pageIdx) => {
            if (pageIdx === currentPageIndex) {
              return page.filter((_, idx) => idx !== rowIndex);
            }
            return page;
          })
        );
      },
    },
    debugTable: true,
  });

  const canPreviousPage = currentPageIndex > 0;
  const canNextPage = currentPageIndex < totalPages - 1;

  const goToFirstPage = () => setCurrentPageIndex(0);
  const goToPreviousPage = () => setCurrentPageIndex((i) => Math.max(0, i - 1));
  const goToNextPage = () =>
    setCurrentPageIndex((i) => Math.min(totalPages - 1, i + 1));
  const goToLastPage = () => setCurrentPageIndex(totalPages - 1);

  return (
    <div className="user-edit-table">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      <span className="cell-header">
                        {cell.column.columnDef.header?.toString()}
                      </span>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <div className="pagination-buttons">
          <button
            type="button"
            onClick={goToFirstPage}
            disabled={!canPreviousPage}
          >
            {"<<"}
          </button>
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
          >
            {"<"}
          </button>
          <span className="pagination-info">
            Page {currentPageIndex + 1} of {totalPages} ({currentPageData.length}{" "}
            rows)
          </span>
          <button type="button" onClick={goToNextPage} disabled={!canNextPage}>
            {">"}
          </button>
          <button type="button" onClick={goToLastPage} disabled={!canNextPage}>
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};
