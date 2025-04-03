import type { FC } from "react";
import { ActionMeta, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { IReactSelect } from "../../utils/interfaces/Select";
import LabelInput from "../labelInput/LabelInput";

interface SelectInputProps {
  className?: string;
  name: string;
  value: IReactSelect | null;
  label: string;
  jutifyLabel?: string;
  error?: string;
  options: IReactSelect[];
  mandatory?: boolean;
  placeholder?: string;
  onChange: (
    event: SingleValue<IReactSelect>,
    a: ActionMeta<IReactSelect>
  ) => Promise<void>;
  onCreateOption?: (inputValue: string) => Promise<void>;
  disabled?: boolean;
}

const SelectInput: FC<SelectInputProps> = ({
  className,
  label,
  value,
  name,
  error,
  options,
  placeholder,
  mandatory = false,
  jutifyLabel,
  onChange,
  onCreateOption,
  disabled,
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput
        className={`${jutifyLabel}`}
        name={name}
        label={label}
        mandatory={mandatory}
      />

      <CreatableSelect
        name={name}
        isClearable
        placeholder={placeholder}
        onChange={onChange}
        onCreateOption={onCreateOption}
        options={options}
        value={value}
        isDisabled={disabled}
      />
      <small className="p-error">{error}</small>
    </section>
  );
};
export default SelectInput;
