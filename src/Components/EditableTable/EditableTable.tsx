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
  Lease,
  LeaseData,
  LEASE_REASONS_CHANGE,
  LEASE_APT_STAT,
  EXEMPT_APT_STAT,
  exampleRentHistoryPages,
} from "./sampleData";

// Helper to check if an apt status is exempt
const isExemptStatus = (status: string): boolean =>
  EXEMPT_APT_STAT.includes(status as (typeof LEASE_APT_STAT)[number]);

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
  cell: function Cell({ getValue, row, column, table }) {
    const tableMeta = table.options.meta;
    const index = row.index;
    const {
      id,
      columnDef: { meta: columnMeta },
    } = column;

    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    // Check if this row is exempt (disable all fields except aptStat)
    const isRowExempt = isExemptStatus(row.original.aptStat);
    const isDisabled = isRowExempt && id !== "aptStat";

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
        if (isDisabled) return;
        const newValue = option?.value || "";
        setValue(newValue);
        tableMeta?.updateData(index, id, newValue);
      };

      const DropdownAny = Dropdown as unknown as React.ComponentType<{
        labelText: string;
        options: Option[];
        value: Option | null;
        onChange: (option: Option | null) => void;
        disabled?: boolean;
      }>;

      return (
        <DropdownAny
          labelText=""
          options={isDisabled ? [] : options}
          value={isDisabled ? null : selectedOption}
          onChange={handleDropdownChange}
          disabled={isDisabled}
        />
      );
    } else if (columnMeta?.type === "date") {
      return (
        <div className="jfcl-date-input">
          <input
            name={id}
            type="date"
            value={isDisabled ? "" : (value as string)}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            disabled={isDisabled}
          />
        </div>
      );
    } else if (columnMeta?.type === "number") {
      return (
        <TextInput
          id={`${id}-${index}`}
          labelText=""
          type="number"
          value={isDisabled ? "" : (value as string)}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          disabled={isDisabled}
        />
      );
    } else if (columnMeta?.type === "money") {
      return (
        <TextInput
          id={`${id}-${index}`}
          className="money-input"
          labelText=""
          type="money"
          value={isDisabled ? "" : (value as string)}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          disabled={isDisabled}
        />
      );
    } else {
      return (
        <TextInput
          id={`${id}-${index}`}
          labelText=""
          type="text"
          value={isDisabled ? "" : (value as string)}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          disabled={isDisabled}
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
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
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

  // Use example lease data (5 pages)
  const [pages, setPages] = React.useState(() => exampleRentHistoryPages);
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
                  // Special handling for aptStat changes
                  if (columnId === "aptStat") {
                    const newStatus = value as string;
                    const wasExempt = isExemptStatus(row.aptStat);
                    const isNowExempt = isExemptStatus(newStatus);

                    if (!wasExempt && isNowExempt) {
                      // Changing to exempt: save current data and clear fields
                      const savedData: LeaseData = {
                        filingDate: row.filingDate,
                        legalRent: row.legalRent,
                        prefRent: row.prefRent,
                        paidRent: row.paidRent,
                        reasonsChange: row.reasonsChange,
                        leaseStart: row.leaseStart,
                        leaseEnd: row.leaseEnd,
                      };
                      return {
                        ...row,
                        aptStat: newStatus as Lease["aptStat"],
                        savedData,
                        filingDate: "",
                        legalRent: 0,
                        prefRent: 0,
                        paidRent: 0,
                        reasonsChange: "",
                        leaseStart: "",
                        leaseEnd: "",
                      };
                    } else if (wasExempt && !isNowExempt && row.savedData) {
                      // Changing from exempt to non-exempt: restore saved data
                      const { savedData, ...rest } = row;
                      return {
                        ...rest,
                        aptStat: newStatus as Lease["aptStat"],
                        filingDate: savedData.filingDate,
                        legalRent: savedData.legalRent,
                        prefRent: savedData.prefRent,
                        paidRent: savedData.paidRent,
                        reasonsChange: savedData.reasonsChange,
                        leaseStart: savedData.leaseStart,
                        leaseEnd: savedData.leaseEnd,
                        savedData: undefined,
                      };
                    }
                  }
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
      <div className="page-info">
        Page {currentPageIndex + 1} of your rent history document{" "}
        <br className="mobile-only" />({currentPageData[0]?.regYear || "?"}–
        {currentPageData[currentPageData.length - 1]?.regYear || "?"})
      </div>
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
            const rowClasses = [
              row.original.hasErrors ? "has-errors" : "",
              isExemptStatus(row.original.aptStat) ? "is-exempt" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <tr key={row.id} className={rowClasses || undefined}>
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
          <Button
            variant="secondary"
            size="small"
            labelText="<"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
          />
          <span className="page-info">
            Page {currentPageIndex + 1} of your rent history document
            <br />({currentPageData[0]?.regYear || "?"}–
            {currentPageData[currentPageData.length - 1]?.regYear || "?"})
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
