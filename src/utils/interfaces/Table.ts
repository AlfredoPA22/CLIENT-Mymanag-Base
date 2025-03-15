import {
  ColumnEditorOptions,
  ColumnFilterElementTemplateOptions,
  ColumnProps,
} from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';

export interface DataTableColumn<T> extends ColumnProps {
  field: string;
  header: string;
  sortable?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  filterField?: string;
  filterMatchMode?: FilterMatchMode;
  filterElement?: (
    options: ColumnFilterElementTemplateOptions,
  ) => React.ReactNode;
  body?: (rowData: T) => React.ReactNode;
  fieldEditor?: (options: ColumnEditorOptions) => React.ReactNode;
}

export interface IndexSignature {
  [key: string]: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
}

export type StatusBodyTemplate = {
  [key: string]: { label: string; severity: 'success' | 'danger' };
};
