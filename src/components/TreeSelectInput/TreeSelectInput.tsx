import type { FC } from "react";

import { TreeSelect, TreeSelectProps } from "primereact/treeselect";
import LabelInput from "../labelInput/LabelInput";

interface TreeSelectInputProps extends TreeSelectProps {
  className?: string;
  label: string;
  justifyLabel?: string;
  error?: string;
  mandatory?: boolean;
}

const TreeSelectInput: FC<TreeSelectInputProps> = ({
  className,
  label,
  error,
  value,
  name,
  placeholder,
  mandatory = false,
  justifyLabel,
  ...props
}) => {
  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput
        className={`${justifyLabel}`}
        name={name}
        label={label}
        mandatory={mandatory}
      />

      <TreeSelect
        className={`flex flex-row ${error ? "p-invalid" : ""}`}
        value={value}
        name={name}
        placeholder={placeholder}
        {...props}
      />

      <small className="p-error">{error}</small>
    </section>
  );
};
export default TreeSelectInput;
