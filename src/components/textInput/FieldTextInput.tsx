import { InputText, InputTextProps } from "primereact/inputtext";
import { FC, Ref } from "react";
import LabelInput from "../labelInput/LabelInput";

interface FieldTextInputProps extends InputTextProps {
  className?: string;
  label: string;
  error?: string;
  role?: string;
  mandatory?: boolean;
  inputRef?: Ref<HTMLInputElement>;
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
  inputRef,
  ...props
}) => {
  return (
    <section className={`flex flex-col p-inputtext-sm ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <InputText
        className={error ? "p-invalid" : ""}
        role={role}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        ref={inputRef}
        {...props}
      />
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};

export default FieldTextInput;
