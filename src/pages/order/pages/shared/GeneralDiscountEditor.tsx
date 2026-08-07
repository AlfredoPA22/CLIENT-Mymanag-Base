import { SelectButton } from "primereact/selectbutton";
import { FC } from "react";
import { formatAmount } from "../../../../utils/currency";

export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Ninguno", value: "NONE" },
  { label: "Fijo", value: "FIJO" },
  { label: "Porcentual", value: "PORCENTUAL" },
];

interface GeneralDiscountEditorProps {
  discountType: string;
  discountValue: number | null;
  onChangeType: (value: string) => void;
  onChangeValue: (value: number | null) => void;
  subtotal: number;
  currency: string;
}

const GeneralDiscountEditor: FC<GeneralDiscountEditorProps> = ({
  discountType,
  discountValue,
  onChangeType,
  onChangeValue,
  subtotal,
  currency,
}) => {
  const previewDiscount = (() => {
    if (discountType === "NONE" || !discountValue) return 0;
    if (discountType === "PORCENTUAL")
      return parseFloat((subtotal * (discountValue / 100)).toFixed(2));
    return parseFloat(Math.min(discountValue, subtotal).toFixed(2));
  })();
  const previewTotal = parseFloat((subtotal - previewDiscount).toFixed(2));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-orange-700">Descuento general (opcional)</p>
        <div className="flex flex-col gap-2">
          <SelectButton
            value={discountType}
            options={DISCOUNT_TYPE_OPTIONS}
            onChange={(e) => {
              const val = (e.value as string) ?? "NONE";
              onChangeType(val);
              if (val === "NONE") onChangeValue(null);
            }}
            className="text-sm w-full flex [&_.p-button]:flex-1 [&_.p-button]:justify-center"
          />
          {discountType !== "NONE" && (
            <input
              type="number"
              value={discountValue ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                onChangeValue(isNaN(val as number) ? null : val);
              }}
              placeholder={discountType === "PORCENTUAL" ? "%" : currency}
              min={0}
              max={discountType === "PORCENTUAL" ? 100 : undefined}
              className="p-inputtext p-component w-full text-sm"
            />
          )}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal productos:</span>
          <span className="font-medium">{formatAmount(subtotal)} {currency}</span>
        </div>
        {previewDiscount > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>
              Descuento general{discountType === "PORCENTUAL" ? ` (${discountValue}%)` : ""}:
            </span>
            <span>-{formatAmount(previewDiscount)} {currency}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-green-700 border-t pt-1 mt-0.5">
          <span>Total final:</span>
          <span>{formatAmount(previewTotal)} {currency}</span>
        </div>
      </div>
    </div>
  );
};

export default GeneralDiscountEditor;
