import { useCombobox } from "downshift";
import { FC, useEffect, useMemo, useState } from "react";
import LabelInput from "../labelInput/LabelInput";
import { IReactSelect } from "../../utils/interfaces/Select";

const CREATE_VALUE = "__create__";

interface CreatableAutoCompleteProps {
  className?: string;
  label: string;
  name?: string;
  mandatory?: boolean;
  placeholder?: string;
  error?: string;
  options: IReactSelect[];
  value: IReactSelect | null;
  onChange: (value: IReactSelect | null) => void;
  onCreateOption: (inputValue: string) => Promise<IReactSelect | null | void>;
  disabled?: boolean;
}

// Combobox con "crear al vuelo" — mismo comportamiento que un
// <CreatableSelect> de react-select (escribís, si no existe aparece la
// opción de crearlo), pero sobre downshift: headless, sin debounce ni
// estado de carga propio — el filtrado es puramente síncrono con cada tecla,
// nada de "cargando" mientras se escribe. Se usa en vez de react-select o
// el <AutoComplete> de PrimeReact.
const CreatableAutoComplete: FC<CreatableAutoCompleteProps> = ({
  className = "",
  label,
  name,
  mandatory = false,
  placeholder,
  error,
  options,
  value,
  onChange,
  onCreateOption,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value?.label ?? "");
  const [creating, setCreating] = useState(false);

  // Si el valor seleccionado cambia desde afuera (reset del formulario,
  // producto recién creado, etc.), el texto del input tiene que reflejarlo.
  useEffect(() => {
    setInputValue(value?.label ?? "");
  }, [value]);

  // Extraído como función (no solo un useMemo) porque stateReducer también
  // lo necesita: cuando el usuario tipea, downshift recalcula el highlight
  // ANTES de que el useMemo de acá abajo vuelva a correr con el inputValue
  // nuevo — así que ahí se recalculan los items "al vuelo" con la query
  // recién tipeada, no con la vieja.
  const computeItems = (rawQuery: string): IReactSelect[] => {
    const query = rawQuery.trim().toLowerCase();
    const filtered = query
      ? options.filter((o) => o.label.toLowerCase().includes(query))
      : options;
    const exactMatch = options.some((o) => o.label.toLowerCase() === query);

    return query && !exactMatch
      ? [...filtered, { value: CREATE_VALUE, label: `+ Crear "${rawQuery.trim()}"` }]
      : filtered;
  };

  const items: IReactSelect[] = useMemo(
    () => computeItems(inputValue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, inputValue]
  );

  const handleCreate = async (newOptionName: string) => {
    setCreating(true);
    try {
      await onCreateOption(newOptionName);
    } finally {
      setCreating(false);
    }
  };

  // Si se borra/edita parte del texto pero se sale del campo sin confirmar
  // una selección o creación nueva (ni Enter, ni click en una opción), el
  // valor bindeado (`value`) nunca cambió — seguía siendo el de antes. Sin
  // esto, el texto quedaba a medio borrar en pantalla mientras por dentro
  // seguía seleccionado el original completo, pareciendo que era "otro".
  // Se descarta la edición a medias y se vuelve a mostrar el valor real.
  const handleBlur = () => {
    const confirmedLabel = value?.label ?? "";
    if (inputValue !== confirmedLabel) {
      setInputValue(confirmedLabel);
    }
  };

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox<IReactSelect>({
    items,
    inputValue,
    itemToString: (item) => item?.label ?? "",
    // Sin esto, escribir no resalta nada — solo bajar con la flecha lo hace.
    // Se fuerza a que el primer resultado (o la única opción "+ Crear...")
    // quede resaltado apenas hay algo que mostrar, así un Enter directo
    // (sin tocar la flecha ni el mouse) ya selecciona o crea eso.
    stateReducer: (_state, { changes, type }) => {
      if (type === useCombobox.stateChangeTypes.InputChange) {
        const nextItems = computeItems(changes.inputValue ?? "");
        return {
          ...changes,
          highlightedIndex: nextItems.length > 0 ? 0 : -1,
        };
      }
      return changes;
    },
    onInputValueChange: ({ inputValue: nextValue, type }) => {
      // Solo reacciona a lo que el usuario efectivamente tipeó — downshift
      // también dispara este evento cuando reescribe el input tras una
      // selección, y ese caso ya lo maneja onSelectedItemChange.
      if (type === useCombobox.stateChangeTypes.InputChange) {
        setInputValue(nextValue ?? "");
        if (!nextValue) onChange(null);
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;

      if (selectedItem.value === CREATE_VALUE) {
        const newName = selectedItem.label.replace(/^\+ Crear "/, "").replace(/"$/, "");
        void handleCreate(newName);
        return;
      }

      setInputValue(selectedItem.label);
      onChange(selectedItem);
    },
  });

  return (
    <section className={`flex flex-col ${className}`}>
      <LabelInput name={name} label={label} mandatory={mandatory} />
      <div className="relative">
        <input
          {...getInputProps({
            placeholder,
            disabled: disabled || creating,
            className: `p-inputtext p-component w-full ${error ? "p-invalid" : ""}`,
            onBlur: handleBlur,
          })}
        />
        <ul
          {...getMenuProps()}
          className={`absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg ${
            isOpen && items.length ? "" : "hidden"
          }`}
        >
          {isOpen &&
            items.map((item, index) => (
              <li
                key={item.value}
                {...getItemProps({ item, index })}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  highlightedIndex === index ? "bg-blue-50" : ""
                } ${item.value === CREATE_VALUE ? "font-medium text-green-700" : "text-gray-700"}`}
              >
                {item.label}
              </li>
            ))}
        </ul>
      </div>
      <small className="p-error text-xs block h-5">{error}</small>
    </section>
  );
};

export default CreatableAutoComplete;
