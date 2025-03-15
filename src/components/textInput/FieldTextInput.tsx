import { InputText, InputTextProps } from 'primereact/inputtext';
import { FC } from 'react';
import LabelInput from '../labelInput/LabelInput';

interface FieldTextInputProps extends InputTextProps {
  className?: string;
  label: string;
  error?: string;
  role?: string;
  mandatory?: boolean;
}

const FieldTextInput: FC<FieldTextInputProps> = ({
  className,
  role,
  type,
  name,
  placeholder,
  value,
  disabled,
  error,
  label,
  mandatory = false,
  onChange,
  ...props
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <InputText
        className={error ? 'p-invalid' : ''}
        role={role}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <small className='p-error'>{error}</small>
    </section>
  );
};

export default FieldTextInput;
