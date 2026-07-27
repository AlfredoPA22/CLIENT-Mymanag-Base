import { useQuery } from "@apollo/client";
import { QR_PAYMENT_AVAILABLE } from "../graphql/queries/QrPayment";

const useQrPaymentAvailable = (): boolean => {
  const { data } = useQuery<{ qrPaymentAvailable: boolean }>(QR_PAYMENT_AVAILABLE);
  return data?.qrPaymentAvailable ?? true;
};

export default useQrPaymentAvailable;
