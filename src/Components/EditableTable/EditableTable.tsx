import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  RowData,
} from "@tanstack/react-table";
import { Button, Dropdown, TextInput } from "@justfixnyc/component-library";
import React from "react";

import "./EditableTable.scss";
import {
  makeData,
  Lease,
  LEASE_REASONS_CHANGE,
  LEASE_APT_STAT,
} from "./sampleData";

// Helper to create sample pages with variable row counts
const makePages = (rowCounts: number[]): Lease[][] => {
  const totalRows = rowCounts.reduce((sum, count) => sum + count, 0);
  const allData = makeData(totalRows);

  const pages: Lease[][] = [];
  let startIndex = 0;

  for (const count of rowCounts) {
    pages.push(allData.slice(startIndex, startIndex + count));
    startIndex += count;
  }

  return pages;
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
  hasErrors: false,
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

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (columnMeta?.type === "select") {
      const options = columnMeta?.options || [];
      const selectedOption = options.find((opt) => opt.value === value) || null;

      const handleDropdownChange = (option: Option | null) => {
        const newValue = option?.value || "";
        setValue(newValue);
        tableMeta?.updateData(index, id, newValue);
      };

      const DropdownAny = Dropdown as unknown as React.ComponentType<{
        labelText: string;
        options: Option[];
        value: Option | null;
        onChange: (option: Option | null) => void;
      }>;

      return (
        <DropdownAny
          labelText=""
          options={options}
          value={selectedOption}
          onChange={handleDropdownChange}
        />
      );
    } else if (columnMeta?.type === "date") {
      return (
        <input
          name={id}
          type="date"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    } else if (columnMeta?.type === "number") {
      return (
        <TextInput
          id={`${id}-${index}`}
          labelText=""
          type="number"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    } else if (columnMeta?.type === "money") {
      return (
        <TextInput
          id={`${id}-${index}`}
          className="money-input"
          labelText=""
          type="money"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    } else {
      return (
        <TextInput
          id={`${id}-${index}`}
          labelText=""
          type="text"
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
        cell: function RegYearCell({
          getValue,
          row: { index, original },
          column,
          table,
        }) {
          const tableMeta = table.options.meta;
          const { id } = column;
          const initialValue = getValue();
          const [value, setValue] = React.useState(initialValue);

          React.useEffect(() => {
            setValue(initialValue);
          }, [initialValue]);

          // Check if this is a new row (empty regYear)
          const isNewRow = !original.regYear || original.regYear === "";

          if (!isNewRow) {
            // Non-editable for existing rows
            return <span>{value as string}</span>;
          }

          // Editable for new rows
          const onBlur = () => {
            tableMeta?.updateData(index, id, value);
          };

          return (
            <TextInput
              labelText=""
              id={`${id}-${index}`}
              value={value as string}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
            />
          );
        },
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
        meta: { type: "money" },
      },
      {
        accessorKey: "prefRent",
        header: "Prefer. Rent",
        meta: { type: "money" },
      },
      {
        accessorKey: "paidRent",
        header: "Actual Paid Rent",
        meta: { type: "money" },
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
        header: "",
        cell: ({ row, table }) => (
          <button
            type="button"
            className="text-link text-link--delete"
            onClick={() => table.options.meta?.removeRow(row.index)}
          >
            Clear values
          </button>
        ),
      },
    ],
    []
  );

  // Sample pages with variable row counts from 1983 to 2025 (43 years total)
  const [pages, setPages] = React.useState(() => makePages([11, 8, 10, 14]));
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
              // rowIndex of -1 means insert at the beginning
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
              return page.map((row, idx) => {
                if (idx === rowIndex) {
                  // Clear all values except regYear
                  return {
                    ...emptyLease(),
                    regYear: row.regYear,
                  };
                }
                return row;
              });
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

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const goToPreviousPage = () => {
    setCurrentPageIndex((i) => Math.max(0, i - 1));
    scrollToTop();
  };

  const goToNextPage = () => {
    setCurrentPageIndex((i) => Math.min(totalPages - 1, i + 1));
    scrollToTop();
  };

  return (
    <div className="user-edit-table">
      <div className="table-container">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="table-header">
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
                <tr
                  key={row.id}
                  className={row.original.hasErrors ? "has-errors" : ""}
                >
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
      </div>
      <div className="pagination">
        <div className="pagination-buttons">
          <Button
            variant="secondary"
            size="small"
            labelText="<"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
          />
          <span className="page-info">
            {currentPageData[0]?.regYear || "?"}–
            {currentPageData[currentPageData.length - 1]?.regYear || "?"}
          </span>
          <Button
            variant="secondary"
            size="small"
            labelText=">"
            onClick={goToNextPage}
            disabled={!canNextPage}
          />
        </div>
      </div>
    </div>
  );
};
