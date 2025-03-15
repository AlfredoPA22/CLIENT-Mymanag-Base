import { ColumnEditorOptions } from "primereact/column";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import FieldNumberInput from "../FieldNumberInput/FieldNumberInput";

export const numberEditor = (
  options: ColumnEditorOptions,
  minFractionDigits: boolean = false
) => (
  <FieldNumberInput
    className="md:col-span-1"
    label=""
    value={options.value}
    useGrouping={false}
    {...(minFractionDigits
      ? { minFractionDigits: 0, maxFractionDigits: 2 }
      : {})}
    onChange={
      (e: InputNumberChangeEvent) => options.editorCallback!(e.value) // Usa '!' para asegurarte de que 'editorCallback' no sea undefined
    }
  />
);
