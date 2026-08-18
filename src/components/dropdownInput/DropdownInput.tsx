import { Dropdown, DropdownProps } from 'primereact/dropdown';
import type { FC } from 'react';
import LabelInput from '../labelInput/LabelInput';

interface DropdownInputProps extends DropdownProps {
  className?: string;
  label: string;
  jutifyLabel?: string;
  error?: string;
  mandatory?: boolean;
}

const DropdownInput: FC<DropdownInputProps> = ({
  className,
  label,
  error,
  value,
  name,
  options,
  placeholder,
  filter,
  optionLabel,
  mandatory = false,
  jutifyLabel,
  onChange,
  ...props
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput
        className={`${jutifyLabel}`}
        name={name}
        label={label}
        mandatory={mandatory}
      />
      <Dropdown
        className={`flex flex-row ${error ? 'p-invalid' : ''}`}
        value={value}
        options={options}
        name={name}
        placeholder={placeholder}
        filter={filter}
        optionLabel={optionLabel}
        onChange={onChange}
        panelStyle={{ maxWidth: '95vw' }}
        panelClassName="[&_.p-dropdown-item]:whitespace-normal [&_.p-dropdown-item]:leading-snug"
        {...props}
      />
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};
export default DropdownInput;
