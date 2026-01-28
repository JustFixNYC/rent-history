import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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

function useSkipper() {
  const shouldSkipRef = React.useRef(true);
  const shouldSkip = shouldSkipRef.current;

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  React.useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

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
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(1000));

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
    debugTable: true,
  });

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
    </div>
  );
};
