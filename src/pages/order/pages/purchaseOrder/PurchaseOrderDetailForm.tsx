import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { ActionMeta, SingleValue } from "react-select";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import SelectInput from "../../../../components/SelectInput/SelectInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import { CREATE_WAREHOUSE } from "../../../../graphql/mutations/Warehouse";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import { LIST_WAREHOUSE } from "../../../../graphql/queries/Warehouse";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IPurchaseOrderDetailInput } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { showToast } from "../../../../utils/toastUtils";
import useProductList from "../../../product/hooks/useProductList";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { schemaFormPurchaseOrderDetail } from "../../validations/FormPurchaseOrderDetailValidation";

interface PurchaseOrderDetailFormProps {
  purchaseOrderId: string;
}

const PurchaseOrderDetailForm: FC<PurchaseOrderDetailFormProps> = ({
  purchaseOrderId,
}) => {
  const dispatch = useDispatch();
  const [createPurchaseOrderDetail] = useMutation(
    CREATE_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
      ],
    }
  );
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });

  const initialValues: IPurchaseOrderDetailInput = {
    product: "",
    purchase_order: purchaseOrderId,
    purchase_price: "",
    quantity: "",
    warehouse: "",
  };

  const { listProduct, loadingListProduct } = useProductList();
  const { listWarehouseSelect } = useWarehouseList();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<IReactSelect | null>(null);

  const onSubmit = async () => {
    const { data } = await createPurchaseOrderDetail({ variables: values });
    resetForm();
    dispatch(setPurchaseOrder(data.createPurchaseOrderDetail.purchase_order));
    setSelectedProduct(null);
    setSelectedWarehouse(null);
  };

  const handleProductChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProduct(value ? value : null);
    setSelectedWarehouse(null);
    setFieldValue("warehouse", "");
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleWarehouseChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedWarehouse(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const onCreateWarehouse = async (inputValue: string) => {
    try {
      const { data } = await createWarehouse({
        variables: {
          name: inputValue,
          description: "",
        },
      });

      if (data) {
        showToast({
          detail: "Almacén creado",
          severity: ToastSeverity.Success,
        });

        setSelectedWarehouse({
          value: data.createWarehouse._id,
          label: data.createWarehouse.name,
        });

        setFieldValue("warehouse", data.createWarehouse._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    isValid,
    isSubmitting,
    errors,
    dirty,
    setFieldValue,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Producto añadido a la compra",
    handleSubmit: onSubmit,
    validationSchema: schemaFormPurchaseOrderDetail,
  });

  if (loadingListProduct) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="mb-2">
      <form
        onSubmit={handleSubmit}
        className="flex justify-center items-center"
      >
        <div className="flex md:flex-row flex-col justify-center gap-5">
          <section className="grid md:grid-cols-4 grid-cols-1 gap-5 justify-center items-start">
            <DropdownInput
              className="md:col-span-2"
              label="Producto"
              name="product"
              optionLabel="fullName"
              placeholder="Seleccionar producto"
              filter={true}
              showClear={true}
              mandatory
              options={listProduct}
              value={selectedProduct}
              error={errors.product ? errors.product : ""}
              onChange={handleProductChange}
            />

            {selectedProduct &&
              selectedProduct.stock_type === stockType.INDIVIDUAL && (
                <SelectInput
                  label="Almacén"
                  name="warehouse"
                  placeholder="Seleccionar almacén"
                  mandatory
                  options={listWarehouseSelect}
                  error={errors.warehouse ? errors.warehouse : ""}
                  onChange={handleWarehouseChange}
                  onCreateOption={onCreateWarehouse}
                  value={selectedWarehouse}
                />
              )}

            <FieldTextInput
              className="md:col-span-1"
              label="Precio de compra"
              type="number"
              name="purchase_price"
              mandatory
              placeholder="Precio de Compra"
              value={values.purchase_price}
              error={errors.purchase_price ? errors.purchase_price : ""}
              onChange={handleChange}
            />

            <FieldTextInput
              className="md:col-span-1"
              label="Cantidad"
              type="number"
              name="quantity"
              mandatory
              placeholder="Cantidad"
              value={values.quantity}
              error={errors.quantity ? errors.quantity : ""}
              onChange={handleChange}
            />
          </section>
          <section className="flex items-end justify-center">
            <Button
              className="md:col-span-2"
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Agregar producto"
              disabled={!dirty || !isValid || isSubmitting}
            />
          </section>
        </div>
      </form>
    </Card>
  );
};

export default PurchaseOrderDetailForm;
