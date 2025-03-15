import type { FC } from 'react';

import { InputNumber, InputNumberProps } from 'primereact/inputnumber';

import LabelInput from '../labelInput/LabelInput';

interface FieldNumberInputProps extends InputNumberProps {
  className?: string;
  label: string;
  error?: string;
  role?: string;
  mandatory?: boolean;
  minFranction?: number;
  maxFranction?: number;
}

const FieldNumberInput: FC<FieldNumberInputProps> = ({
  className,
  role,
  placeholder,
  value,
  disabled,
  error,
  label,
  name,
  type,
  mandatory = false,
  minFranction = 0,
  maxFranction = 2,
  ...props
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <InputNumber
        className={error ? 'p-invalid' : ''}
        role={role}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        {...props}
        minFractionDigits={minFranction}
        maxFractionDigits={maxFranction}
      />
      <small className='p-error'>{error}</small>
    </section>
  );
};
export default FieldNumberInput;
