import { severityStatus } from "../../../utils/constants/severityStatus";
import { productSerialStatus } from "../../../utils/enums/productSerialStatus";
import { orderStatus } from "../../../utils/enums/orderStatus.enum";
import { Status } from "../../../utils/types/StatusType";
import { productStatus } from "../../../utils/enums/productStatus";

export const getStatus = (status: string): Status | null => {
  switch (status) {
    case orderStatus.BORRADOR:
      return {
        severity: severityStatus.borrador,
        label: orderStatus.BORRADOR,
      };
    case orderStatus.APROBADO:
      return {
        severity: severityStatus.aprobado,
        label: orderStatus.APROBADO,
      };
    case orderStatus.CANCELADO:
      return {
        severity: severityStatus.cancelado,
        label: orderStatus.CANCELADO,
      };
    case orderStatus.DEVUELTO:
      return {
        severity: severityStatus.devuelto,
        label: orderStatus.DEVUELTO,
      };
    case productSerialStatus.RESERVADO:
      return {
        severity: severityStatus.reservado,
        label: productSerialStatus.RESERVADO,
      };
    case productSerialStatus.DISPONIBLE:
      return {
        severity: severityStatus.disponible,
        label: productSerialStatus.DISPONIBLE,
      };
    case productSerialStatus.VENDIDO:
      return {
        severity: severityStatus.vendido,
        label: productSerialStatus.VENDIDO,
      };
    case productStatus.SIN_STOCK:
      return {
        severity: severityStatus.sin_stock,
        label: productStatus.SIN_STOCK,
      };

    default:
      return null;
  }
};
