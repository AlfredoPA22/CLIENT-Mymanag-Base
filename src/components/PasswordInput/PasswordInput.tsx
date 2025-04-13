import type { FC } from "react";

import { Password, PasswordProps } from "primereact/password";
import LabelInput from "../labelInput/LabelInput";

interface PasswordInputProps extends PasswordProps {
  className?: string;
  label: string;
  error?: string;
  role?: string;
  mandatory?: boolean;
}

const PasswordInput: FC<PasswordInputProps> = ({
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
  inputId,
  onChange,
  ...props
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <Password
        className={`flex flex-col ${error ? "p-invalid" : ""}`}
        inputId={inputId}
        role={role}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        feedback={false}
        toggleMask
        {...props}
      />
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};

export default PasswordInput;
