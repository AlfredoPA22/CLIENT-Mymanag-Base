import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { FC, useEffect, useRef, useState } from "react";
import { canDoAny } from "../../casl/ability";
import { useAbility } from "../../casl/AbilityContext";
import { UPDATE_COMPANY } from "../../graphql/mutations/Company";
import { GENERATE_DEPOSIT_QR } from "../../graphql/mutations/QrPayment";
import { DETAIL_COMPANY } from "../../graphql/queries/Company";
import { formatAmount } from "../../utils/currency";
import { getSocket } from "../../utils/socket";

interface QrPaymentModalProps {
  visible: boolean;
  onHide: () => void;
  amount: number;
  referenceId: string;
  description?: string;
  saleOrderId: string;
  type: "venta_contado" | "abono_credito";
  onConfirmed?: () => void;
}

interface DepositQrResult {
  transactionId: string;
  transactionStatus: string;
  calculatedFiatAmount: string;
  qrCodeBase64: string;
  referenceId: string;
  fiatCurrency: string;
}

const FAILED_STATUSES = ["reject_transaction", "failed_transaction", "expired_transaction"];

const QrPaymentModal: FC<QrPaymentModalProps> = ({
  visible,
  onHide,
  amount,
  referenceId,
  description,
  saleOrderId,
  type,
  onConfirmed,
}) => {
  const ability = useAbility();
  const canEditCompany = canDoAny(ability, ["UPDATE_COMPANY"]);

  const {
    data: companyData,
    loading: companyLoading,
    refetch: refetchCompany,
  } = useQuery(DETAIL_COMPANY, { skip: !visible, fetchPolicy: "network-only" });
  const company = companyData?.detailCompany;
  const needsExchangeRate = !companyLoading && company?.currency === "$" && !company?.exchange_rate;

  const [rateInput, setRateInput] = useState<number | null>(null);
  const [updateCompany, { loading: savingRate, error: saveRateError }] = useMutation(UPDATE_COMPANY);

  const handleSaveExchangeRate = async () => {
    if (!rateInput || rateInput <= 0) return;
    try {
      await updateCompany({ variables: { input: { exchange_rate: rateInput } } });
      await refetchCompany();
    } catch {
      // el error ya queda expuesto vía saveRateError
    }
  };

  const [generateDepositQr, { loading, data, error }] = useMutation<{
    generateDepositQr: DepositQrResult;
  }>(GENERATE_DEPOSIT_QR);

  const [attempt, setAttempt] = useState(0);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const notifiedRef = useRef(false);
  const startedForRef = useRef<{ attempt: number } | null>(null);

  const runGenerate = () => {
    setLiveStatus(null);
    const uniqueReferenceId = `${referenceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    generateDepositQr({
      variables: {
        input: {
          amount,
          referenceId: uniqueReferenceId,
          description,
          saleOrderId,
          type,
        },
      },
    }).catch(() => {});
  };

  useEffect(() => {
    if (!visible) {
      // El modal se cerró — al reabrirlo debe generar un QR nuevo.
      startedForRef.current = null;
      return;
    }
    if (companyLoading || needsExchangeRate) return;

    // React StrictMode (solo en desarrollo) invoca este efecto dos veces
    // seguidas con las mismas dependencias al montar — sin este guard se
    // generaban 2 QR/transacciones reales para el mismo pedido.
    if (startedForRef.current?.attempt === attempt) return;
    startedForRef.current = { attempt };

    notifiedRef.current = false;
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, attempt, companyLoading, needsExchangeRate]);

  const result = data?.generateDepositQr;

  useEffect(() => {
    const transactionId = result?.transactionId;
    if (!transactionId) return;

    const socket = getSocket();
    const join = () => socket.emit("join_qr_payment", transactionId);
    join();
    socket.on("connect", join);

    const handleUpdate = (payload: { transactionId: string; status: string }) => {
      if (payload.transactionId !== transactionId) return;
      setLiveStatus((prev) => (prev === "completed_transaction" ? prev : payload.status));
      if (payload.status === "completed_transaction" && !notifiedRef.current) {
        notifiedRef.current = true;
        onConfirmed?.();
      }
    };

    socket.on("qr_payment_update", handleUpdate);

    return () => {
      socket.off("connect", join);
      socket.off("qr_payment_update", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.transactionId]);

  const qrSrc = result?.qrCodeBase64
    ? result.qrCodeBase64.startsWith("data:")
      ? result.qrCodeBase64
      : `data:image/png;base64,${result.qrCodeBase64}`
    : null;

  const alreadyPaidError = !!error?.message?.includes("ya está pagada");

  useEffect(() => {
    if (alreadyPaidError && !notifiedRef.current) {
      notifiedRef.current = true;
      onConfirmed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyPaidError]);

  const isConfirmed = liveStatus === "completed_transaction" || alreadyPaidError;
  const isFailed = !alreadyPaidError && !!liveStatus && FAILED_STATUSES.includes(liveStatus);
  const isUsdConversion = company?.currency === "$" && !!company?.exchange_rate;

  const handleHide = () => {
    onHide();
  };

  return (
    <Dialog
      header="Cobro con QR"
      visible={visible}
      onHide={handleHide}
      className="w-[95vw] md:w-[26rem]"
      modal
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        {companyLoading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <i className="pi pi-spin pi-spinner text-3xl text-gray-400" />
          </div>
        )}

        {needsExchangeRate && (
          <div className="flex flex-col items-center gap-3 py-4">
            <i className="pi pi-exclamation-triangle text-3xl text-amber-500" />
            <p className="text-sm text-gray-700">
              Esta empresa cobra en dólares pero no tiene un tipo de cambio configurado. No se puede
              generar el QR sin eso.
            </p>
            {canEditCompany ? (
              <div className="flex w-full flex-col items-center gap-2">
                <InputNumber
                  value={rateInput}
                  onValueChange={(e) => setRateInput(e.value ?? null)}
                  placeholder="Tipo de cambio (Bs por $)"
                  minFractionDigits={2}
                  maxFractionDigits={4}
                  className="w-full"
                  inputClassName="w-full"
                />
                <Button
                  label="Guardar y generar QR"
                  icon="pi pi-check"
                  severity="success"
                  className="w-full"
                  disabled={!rateInput || rateInput <= 0 || savingRate}
                  loading={savingRate}
                  onClick={handleSaveExchangeRate}
                />
                {saveRateError && <p className="text-xs text-red-600">{saveRateError.message}</p>}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Pedile a un administrador que configure el tipo de cambio en Ajustes de la empresa.
              </p>
            )}
          </div>
        )}

        {!companyLoading && !needsExchangeRate && loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <i className="pi pi-spin pi-spinner text-3xl text-gray-400" />
            <p className="text-sm text-gray-500">Generando código QR...</p>
          </div>
        )}

        {!companyLoading && !needsExchangeRate && !loading && isConfirmed && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="relative flex items-center justify-center w-20 h-20">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-check-ring" />
              <svg viewBox="0 0 52 52" className="relative w-20 h-20 text-green-500 animate-check-pop">
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="151"
                  strokeDashoffset="151"
                  className="animate-check-circle"
                />
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 27l7 7 15-15"
                  strokeDasharray="36"
                  strokeDashoffset="36"
                  className="animate-check-tick"
                />
              </svg>
            </div>
            <p className="text-xl font-bold text-green-700">¡Pago recibido!</p>
            {!alreadyPaidError && (
              <>
                <p className="text-sm text-gray-500">
                  {formatAmount(Number(result?.calculatedFiatAmount ?? amount))} {result?.fiatCurrency}
                </p>
                {isUsdConversion && (
                  <p className="text-xs text-gray-400">
                    {formatAmount(amount)} $ × {formatAmount(company!.exchange_rate)} ={" "}
                    {formatAmount(Number(result?.calculatedFiatAmount ?? amount))} Bs
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {!companyLoading && !needsExchangeRate && !loading && !isConfirmed && error && (
          <div className="flex flex-col items-center gap-3 py-4">
            <i className="pi pi-exclamation-triangle text-3xl text-red-500" />
            <p className="text-sm text-red-600">{error.message}</p>
            <Button
              label="Reintentar"
              icon="pi pi-refresh"
              severity="secondary"
              onClick={() => setAttempt((a) => a + 1)}
            />
          </div>
        )}

        {!companyLoading && !needsExchangeRate && !loading && !isConfirmed && !error && qrSrc && isFailed && (
          <div className="flex flex-col items-center gap-3 py-6">
            <i className="pi pi-times-circle text-4xl text-red-500" />
            <p className="text-sm text-red-600">
              {liveStatus === "expired_transaction"
                ? "El QR expiró sin registrar el pago."
                : "El pago no se pudo completar."}
            </p>
            <Button
              label="Generar nuevo QR"
              icon="pi pi-refresh"
              severity="secondary"
              onClick={() => setAttempt((a) => a + 1)}
            />
          </div>
        )}

        {!companyLoading && !needsExchangeRate && !loading && !isConfirmed && !error && qrSrc && !isFailed && (
          <>
            <img
              src={qrSrc}
              alt="Código QR de cobro"
              className="w-56 h-56 rounded-lg border border-gray-200 shadow-sm"
            />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {formatAmount(Number(result?.calculatedFiatAmount ?? amount))} {result?.fiatCurrency}
              </p>
              {isUsdConversion && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatAmount(amount)} $ × {formatAmount(company!.exchange_rate)} Bs ={" "}
                  {formatAmount(Number(result?.calculatedFiatAmount ?? amount))} Bs
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                El cliente escanea este código desde su app para pagar. El QR expira en 15 minutos.
              </p>
              <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                <i className="pi pi-spin pi-spinner" />
                Esperando confirmación de pago...
              </p>
            </div>
          </>
        )}

        <Button label="Cerrar" text className="w-full" onClick={handleHide} />
      </div>
    </Dialog>
  );
};

export default QrPaymentModal;
