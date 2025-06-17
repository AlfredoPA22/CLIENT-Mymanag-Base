import { useApolloClient, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import {
  FIND_SALE_ORDER,
  FIND_SALE_ORDER_TO_PDF,
} from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrder } from "../../../../utils/interfaces/SaleOrder";
import {
  ISaleOrderDetail,
  ISaleOrderDetailToPDF,
} from "../../../../utils/interfaces/SaleOrderDetail";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import useAuth from "../../../auth/hooks/useAuth";

interface CardPrintSaleOrderDetailProps {
  saleOrderId: string;
}

const CardPrintSaleOrderDetail: FC<CardPrintSaleOrderDetailProps> = ({
  saleOrderId,
}) => {
  const {
    data,
    loading: loadingSaleOrder,
    error: errorSaleOrder,
  } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
  });

  const [dataPrintSaleOrder, setDataPrintSaleOrder] = useState<ISaleOrder>();
  const [dataPrintDetailSaleOrder, setDataPrintDetailSaleOrder] =
    useState<ISaleOrderDetail[]>();

  const client = useApolloClient();
  const { currency } = useAuth();

  const {
    data: { listSaleOrderDetail: listSaleOrderDetail } = [],
    loading: loadingListSaleOrderDetail,
    error,
  } = useQuery(LIST_SALE_ORDER_DETAIL, {
    variables: {
      saleOrderId,
    },
    fetchPolicy: "network-only",
  });

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    if (e.newData.sale_price <= 0 || e.newData.quantity <= 0) {
      showToast({
        detail: "El precio y la cantidad son obligatorios.",
        severity: ToastSeverity.Error,
      });
    } else {
      const { newData, index } = e;
      if (dataPrintDetailSaleOrder && dataPrintDetailSaleOrder[index]) {
        const updatedSubtotal =
          Math.round(newData.sale_price * newData.quantity * 100) / 100;

        const updatedDetail: ISaleOrderDetail = {
          ...dataPrintDetailSaleOrder[index],
          sale_price: newData.sale_price,
          quantity: newData.quantity,
          subtotal: updatedSubtotal,
        };

        // Actualiza el estado de dataPrintDetailSaleOrder
        setDataPrintDetailSaleOrder((prevDetails) =>
          prevDetails
            ? prevDetails.map((detail, i) =>
                i === index ? updatedDetail : detail
              )
            : []
        );

        // Actualiza el estado de dataPrintSaleOrder si es necesario
        setDataPrintSaleOrder((prevOrder) => {
          if (prevOrder) {
            const newTotal =
              prevOrder.total -
              dataPrintDetailSaleOrder[index].subtotal +
              updatedDetail.subtotal;
            return {
              ...prevOrder,
              total: parseFloat(newTotal.toFixed(2)),
            };
          }
          return prevOrder;
        });
      } else {
        // Muestra un mensaje de error o realiza alguna acción en caso de que dataPrintDetailSaleOrder esté indefinido
        showToast({
          detail:
            "No se puede editar el detalle de la orden porque no está disponible.",
          severity: ToastSeverity.Error,
        });
      }

      // Muestra una notificación opcional para indicar que la orden se ha actualizado
      showToast({
        detail: "Detalle de la orden actualizado correctamente.",
        severity: ToastSeverity.Success,
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const { data } = await client.query({
        query: FIND_SALE_ORDER_TO_PDF,
        variables: {
          saleOrderId: dataPrintSaleOrder?._id,
        },
        fetchPolicy: "network-only",
      });

      if (
        !data?.findSaleOrderToPDF ||
        !dataPrintSaleOrder ||
        !dataPrintDetailSaleOrder
      ) {
        showToast({
          detail: "No hay datos suficientes para generar el PDF.",
          severity: ToastSeverity.Error,
        });
        return;
      }

      const { saleOrderDetail } = data.findSaleOrderToPDF;

      // Ahora combinamos los seriales de la consulta con los detalles de la orden de venta del estado
      const updatedSaleOrderDetail: ISaleOrderDetailToPDF[] =
        dataPrintDetailSaleOrder.map((detail) => {
          // Encontramos el detalle correspondiente en la respuesta de la consulta
          const matchingSaleOrderDetail = saleOrderDetail.find(
            (apiDetail: { saleOrderDetail: { _id: string } }) =>
              apiDetail.saleOrderDetail._id === detail._id
          );

          // Si encontramos el detalle correspondiente, agregamos los seriales y estructuramos el dato
          if (matchingSaleOrderDetail) {
            return {
              saleOrderDetail: {
                ...detail, // Detalles del estado
                productSerial: matchingSaleOrderDetail.productSerial.map(
                  (serial: {
                    serial: any;
                    product: any;
                    purchase_order_detail: any;
                    sale_order_detail: any;
                    status: any;
                  }) => ({
                    serial: serial.serial,
                    product: serial.product,
                    purchase_order_detail: serial.purchase_order_detail,
                    sale_order_detail: serial.sale_order_detail,
                    status: serial.status,
                  })
                ),
                product: {
                  ...detail.product, // Incluye los detalles del producto
                  code: matchingSaleOrderDetail.saleOrderDetail.product.code, // Agregar el código del producto
                  brand: matchingSaleOrderDetail.saleOrderDetail.product.brand, // Agregar la marca
                },
              },
              productSerial: matchingSaleOrderDetail.productSerial.map(
                (serial: { _id: any; serial: any }) => ({
                  _id: serial._id,
                  serial: serial.serial,
                })
              ),
            };
          }

          return {
            saleOrderDetail: detail, // Si no encontramos el detalle correspondiente, mantenemos el detalle original
            productSerial: [], // En caso de no encontrar seriales, dejamos un arreglo vacío
          };
        });

      // Ahora generamos el PDF con los datos actualizados
      generatePDF({
        saleOrder: dataPrintSaleOrder, // Usamos los datos de la orden de venta desde el estado
        saleOrderDetail: updatedSaleOrderDetail, // Usamos los detalles con los seriales actualizados
      });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const [columns] = useState<DataTableColumn<ISaleOrderDetail>[]>([
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      body: (rowData: ISaleOrderDetail) => (
        <LabelInput label={`${rowData.sale_price} ${currency}`} />
      ),
      fieldEditor: (options: ColumnEditorOptions) =>
        numberEditor(options, true),
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      style: { textAlign: "center" },
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: ISaleOrderDetail) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.subtotal} ${currency}`}
        />
      ),
    },
    {
      field: "serials",
      header: "Seriales Añadidos",
      sortable: true,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (errorSaleOrder) {
      showToast({
        detail: errorSaleOrder.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorSaleOrder]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setDataPrintSaleOrder(data.findSaleOrder);
    }
  }, [data]);

  useEffect(() => {
    if (listSaleOrderDetail) {
      setDataPrintDetailSaleOrder(listSaleOrderDetail);
    }
  }, [listSaleOrderDetail]);

  const date = getDate(data?.findSaleOrder.date) || "";

  return (
    <>
      <Card className="flex flex-col m-2">
        {loadingSaleOrder ? (
          "cargando"
        ) : (
          <div className="flex md:flex-row flex-col justify-between items-center gap-10">
            <section className="md:flex grid *:justify-center items-end gap-10">
              <div>
                <LabelInput name="date" label="Fecha de venta" />
                <Tag value={date} severity={"info"} className="text-xl" />
              </div>
              <div>
                <LabelInput name="client" label="Cliente" />
                <Tag
                  value={`${dataPrintSaleOrder?.client.fullName}`}
                  severity={"info"}
                  className="text-xl"
                />
              </div>
            </section>
            <section className="flex flex-col justify-center items-center gap-2">
              <LabelInput name="date" label="Total de venta: " />
              <Tag
                value={`${dataPrintSaleOrder?.total} ${currency}`}
                severity={"info"}
                className="text-xl"
              />
            </section>
            <section className="flex justify-start items-start">
              <div className="flex flex-col gap-2 items-center justify-center">
                <span className="text-2xl font-bold">
                  {data?.findSaleOrder.code}
                </span>
                {data?.findSaleOrder.status &&
                data?.findSaleOrder.status === orderStatus.APROBADO ? (
                  <Tag
                    severity={
                      getStatus(data?.findSaleOrder.status)?.severity as
                        | "danger"
                        | "success"
                        | "info"
                        | "warning"
                    }
                  >
                    {getStatus(data?.findSaleOrder.status)?.label}
                  </Tag>
                ) : (
                  <>
                    <Tag
                      severity={
                        getStatus(data?.findSaleOrder.status)?.severity as
                          | "danger"
                          | "success"
                          | "info"
                          | "warning"
                      }
                    >
                      {getStatus(data?.findSaleOrder.status)?.label}
                    </Tag>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </Card>
      <Card className="size-full" title="Productos de la venta">
        {loadingListSaleOrderDetail ? (
          "cargando..."
        ) : (
          <div>
            <Table
              columns={columns}
              data={dataPrintDetailSaleOrder || []}
              emptyMessage="Venta sin productos."
              size="small"
              dataFilters={filters}
              tableHeader={renderFilterInput}
              editMode="row"
              onRowEditComplete={onRowEditComplete}
            />
          </div>
        )}
      </Card>
      <div className="flex mt-5 justify-end">
        <Button
          label="IMPRIMIR VENTA"
          raised
          severity="warning"
          aria-label="Cancel"
          onClick={() => handleGeneratePDF()}
        />
      </div>
    </>
  );
};

export default CardPrintSaleOrderDetail;
