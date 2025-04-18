import { InputSwitch, InputSwitchProps } from "primereact/inputswitch";
import { FC } from "react";
import LabelInput from "../labelInput/LabelInput";

interface FielInputSwitchProps extends InputSwitchProps {
  className?: string;
  label: string;
  error?: string;
  role?: string;
  mandatory?: boolean;
}

const FieldInputSwitch: FC<FielInputSwitchProps> = ({
  className,
  role,
  name,
  value,
  disabled,
  error,
  label,
  mandatory = false,
  onChange,
  ...props
}) => {
  return (
    <section className={`flex flex-col p-inputtext-sm ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <InputSwitch
        className={error ? "p-invalid" : ""}
        role={role}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};

export default FieldInputSwitch;
