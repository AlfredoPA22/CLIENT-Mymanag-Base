import { FC } from "react";

import {
  Column,
  ColumnEditorOptions,
  ColumnFilterElementTemplateOptions,
  ColumnProps,
} from "primereact/column";
import {
  DataTable,
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";

import { IndexSignature } from "../../utils/interfaces/Table";
import { FilterMatchMode } from "primereact/api";

export interface DataTableColumn<T> extends ColumnProps {
  field: string;
  header: string | React.ReactNode;
  sortable?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  filterField?: string;
  filterMatchMode?: FilterMatchMode;
  filterElement?: (
    options: ColumnFilterElementTemplateOptions
  ) => React.ReactNode;
  body?: (rowData: T) => React.ReactNode;
  fieldEditor?: (options: ColumnEditorOptions) => React.ReactNode;
}

interface TableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  filterDisplay?: string;
  emptyMessage: string;
  dataFilters?: IndexSignature;
  actionHeader?: string;
  size: "small" | "normal" | "large";
  paginator?: boolean;
  setDataFilters?: (data: IndexSignature) => void;
  tableHeader?: () => JSX.Element;
  actionBodyTemplate?: (rowData: T) => JSX.Element;
  rowClassName?: (data: T) => string | object;
  footer?: string;
  editMode?: "row" | "cell";
  onRowEditComplete?: (e: DataTableRowEditCompleteEvent) => void;
  selecTable?: boolean;
  onSelected?: (row: T | null) => void;
  onSelectionChange?: (e: DataTableSelectionSingleChangeEvent<any[]>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table: FC<TableProps<any>> = ({
  columns,
  data,
  filterDisplay,
  emptyMessage,
  dataFilters,
  actionHeader,
  size,
  tableHeader,
  actionBodyTemplate,
  rowClassName,
  footer,
  editMode,
  onRowEditComplete,
  onSelectionChange,
}) => {
  return (
    <>
      <DataTable
        role="dataTable"
        showGridlines
        value={data}
        dataKey="_id"
        filters={dataFilters}
        filterDisplay={filterDisplay == "row" ? filterDisplay : "menu"}
        scrollable
        scrollHeight={`calc(100vh - 300px)`}
        emptyMessage={emptyMessage}
        size={size}
        header={tableHeader}
        rowClassName={rowClassName}
        paginator
        rows={20}
        footer={footer}
        editMode={editMode ? "row" : undefined} // Activar modo edición por filas
        onRowEditComplete={onRowEditComplete} // Manejar la edición de filas
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      >
        {columns.map((column) => (
          <Column
            key={column.field}
            field={column.field as string}
            header={column.header}
            sortable={column.sortable}
            filter={column.filter}
            filterPlaceholder={column.filterPlaceholder || "Search"}
            filterField={column.filterField || (column.field as string)}
            filterElement={column.filterElement}
            showFilterMenu={column.showFilterMenu}
            body={column.body}
            filterMenuStyle={column.filterMenuStyle}
            style={column.style}
            editor={column.fieldEditor}
          />
        ))}
        {onRowEditComplete && (
          <Column
            rowEditor={true}
            headerStyle={{ width: "5%", minWidth: "6rem" }}
          />
        )}
        {actionBodyTemplate && (
          <Column
            body={actionBodyTemplate}
            headerStyle={{ width: "15%", minWidth: "6rem" }}
            header={actionHeader || "Acciones"}
            exportable={false}
            style={{ minWidth: "12rem" }}
          />
        )}
      </DataTable>
    </>
  );
};

export default Table;
