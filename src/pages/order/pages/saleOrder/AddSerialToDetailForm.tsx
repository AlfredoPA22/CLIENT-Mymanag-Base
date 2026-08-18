import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { FC, useState } from "react";
import BarcodeScannerButton from "../../../../components/barcodeScanner/BarcodeScannerButton";
import LabelInput from "../../../../components/labelInput/LabelInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import { FIND_PRODUCT_SERIAL_BY_SERIAL } from "../../../../graphql/queries/Product";
import { FIND_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL, LIST_SERIAL_BY_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IAddSerialToSaleOrderDetailInput } from "../../../../utils/interfaces/SaleOrderDetail";
import { schemaFormAddSerialToSaleOrderDetail } from "../../validations/FormAddSerialToSaleOrderDetailValidation";
import ResolveSerialWarehouseModal from "./ResolveSerialWarehouseModal";

interface AddSerialToDetailFormProps {
  saleOrderId: string;
  saleOrderDetailId: string;
}

const AddSerialToDetailForm: FC<AddSerialToDetailFormProps> = ({
  saleOrderId,
  saleOrderDetailId,
}) => {
  const apolloClient = useApolloClient();

  const { data: saleOrderData } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    skip: !saleOrderId,
  });
  const noteWarehouse = saleOrderData?.findSaleOrder?.warehouse ?? null;

  const [serialMismatch, setSerialMismatch] = useState<{
    serial: string;
    productId: string;
    productName: string;
    originId: string;
    originName: string;
  } | null>(null);

  const [addSerialToSaleOrderDetail] = useMutation(
    ADD_SERIAL_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_SALE_ORDER_DETAIL,
          variables: {
            saleOrderId,
          },
        },
        {
          query: LIST_SERIAL_BY_SALE_ORDER_DETAIL,
          variables: {
            saleOrderDetailId,
          },
        },
      ],
    }
  );
  const initialValues: IAddSerialToSaleOrderDetailInput = {
    serial: "",
    sale_order_detail: saleOrderDetailId,
  };

  const onSubmit = async () => {
    try {
      await addSerialToSaleOrderDetail({ variables: values });
      resetForm();
    } catch (error: any) {
      if (
        noteWarehouse &&
        typeof error.message === "string" &&
        error.message.includes("Este serial pertenece a otro almacén")
      ) {
        const { data: serialData } = await apolloClient.query({
          query: FIND_PRODUCT_SERIAL_BY_SERIAL,
          variables: { serial: values.serial },
          fetchPolicy: "network-only",
        });
        const foundSerial = serialData?.findProductSerialBySerial;
        if (foundSerial?.warehouse && foundSerial?.product) {
          setSerialMismatch({
            serial: values.serial ?? "",
            productId: foundSerial.product._id,
            productName: foundSerial.product.name,
            originId: foundSerial.warehouse._id,
            originName: foundSerial.warehouse.name,
          });
          throw Object.assign(new Error("serial_warehouse_mismatch"), { silent: true });
        }
      }
      throw error;
    }
  };

  const handleSerialMismatchResolved = async () => {
    if (!serialMismatch) return;
    await addSerialToSaleOrderDetail({
      variables: { serial: serialMismatch.serial, sale_order_detail: saleOrderDetailId },
    });
    resetForm();
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Serial Agregado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormAddSerialToSaleOrderDetail,
  });
  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 justify-center"
    >
      <section className="grid justify-center items-start gap-2">
        <div className="flex items-center gap-2">
          <FieldTextInput
            className="flex justify-center items-center"
            label=""
            type="text"
            name="serial"
            placeholder="Ingresa el codigo del serial"
            value={values.serial}
            error={errors.serial ? errors.serial : ""}
            onChange={handleChange}
          />
          {/* FieldTextInput trae una label vacía + una línea de error debajo,
              lo que le da más alto que el botón — se replica esa misma
              estructura acá (invisible) para que el botón quede a la misma
              altura que el input en vez de centrado contra toda la columna.
              Se reusa LabelInput (con label="" real) en vez de un placeholder
              con texto: una label vacía colapsa a altura ~0, así que un
              mimic con un carácter de verdad queda más alto y desalinea el
              botón hacia abajo. */}
          <div className="flex flex-col p-inputtext-sm">
            <LabelInput label="" className="invisible" />
            <BarcodeScannerButton onScan={(value) => setFieldValue("serial", value)} />
            <span className="text-xs block h-5" />
          </div>
        </div>
      </section>

      <section className="flex justify-center items-start">
        <Button
          className="h-[50px]"
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>

    <ResolveSerialWarehouseModal
      visible={!!serialMismatch}
      onHide={() => setSerialMismatch(null)}
      productId={serialMismatch?.productId ?? ""}
      productName={serialMismatch?.productName ?? ""}
      serial={serialMismatch?.serial ?? ""}
      originWarehouseId={serialMismatch?.originId ?? ""}
      originWarehouseName={serialMismatch?.originName ?? ""}
      destinationWarehouseId={noteWarehouse?._id ?? ""}
      destinationWarehouseName={noteWarehouse?.name ?? ""}
      onResolved={handleSerialMismatchResolved}
    />
    </>
  );
};

export default AddSerialToDetailForm;
