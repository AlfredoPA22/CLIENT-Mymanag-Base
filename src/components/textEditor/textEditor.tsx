import { ColumnEditorOptions } from "primereact/column";
import FieldTextInput from "../textInput/FieldTextInput";
import { ChangeEvent } from "react";

export const textEditor = (options: ColumnEditorOptions) => (
  <FieldTextInput
    className="md:col-span-1"
    label=""
    type="text"
    value={options.value}
    onChange={
      (e: ChangeEvent<HTMLInputElement>) =>
        options.editorCallback!(e.target.value) // Usa '!' para asegurarte de que 'editorCallback' no sea undefined
    }
  />
);
