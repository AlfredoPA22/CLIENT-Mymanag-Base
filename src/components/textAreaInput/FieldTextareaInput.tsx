import { InputTextarea, InputTextareaProps } from 'primereact/inputtextarea';
import type { FC } from 'react';
import LabelInput from '../labelInput/LabelInput';


interface FieldTextareaInputProps extends InputTextareaProps {
  className?: string;
  role?: string;
  label: string;
  error?: string;
  rows?: number;
  cols?: number;
  mandatory?: boolean;
}

const FieldTextareaInput: FC<FieldTextareaInputProps> = ({
  role,
  label,
  error,
  value,
  name,
  placeholder,
  rows,
  cols,
  className,
  mandatory = false,
  onChange,
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <InputTextarea
        className={error ? 'p-invalid' : ''}
        role={role}
        value={value}
        name={name}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        onChange={onChange}
      />
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};
export default FieldTextareaInput;
