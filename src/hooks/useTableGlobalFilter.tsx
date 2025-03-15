import { ChangeEvent, useEffect, useState } from 'react';

import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';

import { IndexSignature } from '../utils/interfaces/Table';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useTableGlobalFilter = (columnsData: any) => {
  const [columns] = useState(columnsData);
  const [filters, setFilters] = useState<IndexSignature>({});

  const onGlobalFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters((prevFilters) => {
      if (prevFilters.global && 'value' in prevFilters.global) {
        return { ...prevFilters, global: { ...prevFilters.global, value } };
      }
      return prevFilters;
    });
  };

  const renderFilterInput = () => {
    const globalFilter = filters['global'];

    if (globalFilter && 'value' in globalFilter) {
      const value = globalFilter.value || '';

      return (
        <span className='p-input-icon-left'>
          <InputText
            role='inputFilter'
            type='search'
            value={value}
            onChange={onGlobalFilterChange}
            placeholder='Buscar'
            className='py-2 sm:w-[300px] w-[200px]'
          />
        </span>
      );
    }
    return <></>;
  };

  useEffect(() => {
    setFilters((prevFilters) => {
      const newFilters: IndexSignature = {
        global: { value: '', matchMode: FilterMatchMode.CONTAINS },
        ...prevFilters,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columns.forEach((column: any) => {
        if (column.filter) {
          newFilters[column.field!] = {
            value: '',
            matchMode: FilterMatchMode.CONTAINS,
          };
        }
      });
      return newFilters;
    });
  }, [columns]);

  return { filters, renderFilterInput };
};

export default useTableGlobalFilter;
