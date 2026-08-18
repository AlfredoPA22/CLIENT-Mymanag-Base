import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import CreatableAutoComplete from "../../../../components/creatableAutoComplete/CreatableAutoComplete";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { OrderDetailFormSkeleton } from "../../../../components/skeleton/OrderDetailFormSkeleton";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import { CREATE_WAREHOUSE } from "../../../../graphql/mutations/Warehouse";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
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
  // Sin refetchQueries acá a propósito: `{query: LIST_WAREHOUSE}` refresca
  // cualquier observer activo de esa query en toda la app por coincidencia de
  // documento — si ese refetch quedaba en vuelo justo cuando este formulario
  // se cierra y se reabre para el siguiente producto, dejaba el select de
  // almacén vacío (mismo bug ya encontrado con categoría/marca en
  // ProductForm.tsx). Se llama a refetchListWarehouse directamente sobre la
  // query de ESTE formulario en vez de depender del matching implícito.
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE);

  const initialValues: IPurchaseOrderDetailInput = {
    product: "",
    purchase_order: purchaseOrderId,
    purchase_price: "",
    quantity: "",
    warehouse: "",
  };

  const { listProduct, loadingListProduct } = useProductList();
  const { listWarehouseSelect, refetchListWarehouse } = useWarehouseList();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<IReactSelect | null>(null);
  // Cambiar la key fuerza a los dropdowns a remontarse tras agregar el
  // producto, para que también se limpie el texto de búsqueda interno del
  // filtro (setear value=null no alcanza para eso).
  const [productFieldsKey, setProductFieldsKey] = useState(0);

  const onSubmit = async () => {
    const { data } = await createPurchaseOrderDetail({ variables: values });
    resetForm();
    dispatch(setPurchaseOrder(data.createPurchaseOrderDetail.purchase_order));
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setProductFieldsKey((k) => k + 1);
  };

  const handleProductChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProduct(value ? value : null);
    setSelectedWarehouse(null);
    setFieldValue("warehouse", "");
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
    setTimeout(() => {
      setFieldValue("purchase_price", value?.last_cost_price || "");
    }, 0);
  };

  const handleWarehouseChange = (value: IReactSelect | null) => {
    setSelectedWarehouse(value);
    setFieldValue("warehouse", value ? value.value : "");
  };

  const onCreateWarehouse = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
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
        await refetchListWarehouse();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
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
    return <OrderDetailFormSkeleton />;
  }

  return (
    <Card className="mb-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row justify-center items-center gap-2"
      >
        <section
          className={`grid w-full md:w-auto ${
            selectedProduct &&
            selectedProduct.stock_type === stockType.INDIVIDUAL
              ? "xl:grid-cols-6"
              : "xl:grid-cols-4"
          }  grid-cols-1 md:grid-cols-2 gap-2 justify-center items-start`}
        >
          <DropdownInput
            key={`product-${productFieldsKey}`}
            className={` ${
              selectedProduct &&
              selectedProduct.stock_type === stockType.INDIVIDUAL
                ? "2xl:w-[400px] md:col-span-2"
                : "2xl:w-[500px] md:col-span-2"
            }`}
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
              <CreatableAutoComplete
                key={`warehouse-${productFieldsKey}`}
                className="2xl:w-[400px] md:col-span-2"
                label="Almacén"
                name="warehouse"
                placeholder="Seleccionar o escribir almacén"
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
        <section className="flex items-end justify-center w-full md:w-auto">
          <Button
            icon="pi pi-plus"
            type="submit"
            severity="success"
            label="Agregar producto"
            className="w-full md:w-auto"
            disabled={!dirty || !isValid || isSubmitting}
          />
        </section>
      </form>
    </Card>
  );
};

export default PurchaseOrderDetailForm;
