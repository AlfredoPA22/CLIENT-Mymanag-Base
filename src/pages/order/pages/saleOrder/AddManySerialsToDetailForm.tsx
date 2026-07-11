import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_MANY_SERIALS_TO_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import {
  LIST_SALE_ORDER_DETAIL,
  LIST_SERIAL_BY_SALE_ORDER_DETAIL,
} from "../../../../graphql/queries/SaleOrderDetail";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { buildSerialRange } from "../../../../utils/interfaces/BuildSerialRange";

interface AddManySerialsToDetailFormProps {
  saleOrderId: string;
  saleOrderDetailId: string;
  remainingSerials?: number;
  onSuccess?: () => void;
}

const AddManySerialsToDetailForm: FC<AddManySerialsToDetailFormProps> = ({
  saleOrderId,
  saleOrderDetailId,
  remainingSerials,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [padding, setPadding] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [preview, setPreview] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [rangeError, setRangeError] = useState("");

  const [addManySerials] = useMutation(
    ADD_MANY_SERIALS_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        { query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } },
        {
          query: LIST_SERIAL_BY_SALE_ORDER_DETAIL,
          variables: { saleOrderDetailId },
        },
      ],
    }
  );

  const startNum = start === "" ? null : Number(start);
  const endNum = end === "" ? null : Number(end);
  const paddingNum = padding === "" ? 0 : Number(padding);

  const totalToGenerate =
    startNum !== null && endNum !== null && endNum >= startNum
      ? endNum - startNum + 1
      : 0;

  const exceedsLimit =
    remainingSerials !== undefined && totalToGenerate > remainingSerials;

  const handleGeneratePreview = () => {
    setRangeError("");

    if (startNum === null || endNum === null) {
      setRangeError("Ingrese el inicio y fin del rango");
      return;
    }
    if (startNum > endNum) {
      setRangeError("El inicio no puede ser mayor al fin");
      return;
    }
    if (exceedsLimit) {
      setRangeError(
        `El rango genera ${totalToGenerate} seriales pero solo faltan ${remainingSerials}`
      );
      return;
    }

    const generated = buildSerialRange({
      prefix,
      start: startNum,
      end: endNum,
      padding: paddingNum,
      suffix,
    });
    setPreview(generated);
  };

  const handleRemoveFromPreview = (serial: string) => {
    setPreview((prev) => prev.filter((s) => s !== serial));
  };

  const handleSave = async () => {
    if (preview.length === 0) {
      showToast({
        detail: "Genere la vista previa antes de guardar",
        severity: ToastSeverity.Error,
      });
      return;
    }

    try {
      setIsSaving(true);
      dispatch(setIsBlocked(true));
      const { data } = await addManySerials({
        variables: {
          addManySerialsToSaleOrderDetailInput: {
            sale_order_detail: saleOrderDetailId,
            serials: preview,
          },
        },
      });

      if (data) {
        showToast({
          detail: `${preview.length} seriales agregados`,
          severity: ToastSeverity.Success,
        });
        setPreview([]);
        setStart("");
        setEnd("");
        setPrefix("");
        setSuffix("");
        setPadding("");
        onSuccess?.();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setIsSaving(false);
      dispatch(setIsBlocked(false));
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 flex flex-col gap-2">
      {/* ── Patrón del serial ───────────────────────────── */}
      <p className="text-sm font-semibold text-gray-700 mb-1">Patrón del serial</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <FieldTextInput
          label="Prefijo"
          type="text"
          name="prefix"
          placeholder="Ej: A-"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />

        <FieldTextInput
          label="Ceros a la izquierda"
          type="number"
          name="padding"
          placeholder="0"
          value={padding}
          onChange={(e) => setPadding(e.target.value)}
        />

        <FieldTextInput
          label="Sufijo"
          type="text"
          name="suffix"
          placeholder="Opcional"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
        />
      </div>

      <Divider className="!my-1" />

      {/* ── Rango ───────────────────────────────────────── */}
      <p className="text-sm font-semibold text-gray-700 mb-1">Rango de numeración</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FieldTextInput
          label="Desde"
          type="number"
          name="start"
          mandatory
          placeholder="Ej: 1"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <FieldTextInput
          label="Hasta"
          type="number"
          name="end"
          mandatory
          placeholder="Ej: 50"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          error={rangeError}
        />
      </div>

      {remainingSerials !== undefined && !rangeError && (
        <p className={`text-xs -mt-3 mb-1 ${exceedsLimit ? "text-red-500" : "text-gray-500"}`}>
          Faltan {remainingSerials} serial(es) por asignar
          {totalToGenerate > 0 && ` — este rango generará ${totalToGenerate}`}
        </p>
      )}

      <Button
        type="button"
        label="Generar vista previa"
        icon="pi pi-refresh"
        severity="info"
        outlined
        onClick={handleGeneratePreview}
        className="w-full sm:w-auto"
      />

      {/* ── Vista previa ──────────────────────────────────── */}
      {preview.length > 0 && (
        <>
          <Divider className="!my-1" />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Vista previa ({preview.length})
          </p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {preview.map((serial) => (
              <span
                key={serial}
                className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs"
              >
                {serial}
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFromPreview(serial)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      <Button
        type="button"
        label={`Guardar ${preview.length > 0 ? `(${preview.length})` : ""} seriales`}
        icon="pi pi-save"
        severity="success"
        disabled={preview.length === 0 || isSaving}
        onClick={handleSave}
        className="w-full mt-1"
      />
    </div>
  );
};

export default AddManySerialsToDetailForm;