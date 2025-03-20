import { useApolloClient } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useState } from "react";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { SEARCH_PRODUCT } from "../../../graphql/queries/Product";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import {
    IProduct,
    ISearchProductInput,
} from "../../../utils/interfaces/Product";
import { getStatus } from "../../order/utils/getStatus";
import { schemaFormSearchProduct } from "../validations/FormSearchProductValidation";

const SearchProductForm = () => {
  const client = useApolloClient();

  const initialValues: ISearchProductInput = {
    serial: "",
  };

  const [productFound, setProductFound] = useState<IProduct | null>(null);

  const onSubmit = async () => {
    const { data } = await client.query({
      query: SEARCH_PRODUCT,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data) {
      setProductFound(data.searchProduct);
    }
  };

  const header = (urlImage: string) => (
    <img className="w-[300px] h-[300px]" alt="Card" src={urlImage} />
  );

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Producto encontrado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSearchProduct,
  });
  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="grid gap-4 justify-center">
        <section className="grid w-[300px] gap-4">
          <FieldTextInput
            role="input-name"
            label="Buscar por serial"
            type="text"
            name="serial"
            placeholder="Ingresar serial"
            value={values.serial}
            error={errors.serial ? errors.serial : ""}
            onChange={handleChange}
          />
        </section>

        <section className="flex justify-center">
          <Button
            type="submit"
            severity="success"
            label="Buscar"
            disabled={!dirty || !isValid || isSubmitting}
          />
        </section>
      </form>

      {productFound && (
        <Card
        className="flex flex-col md:flex-row justify-center"
          title={productFound.name}
          subTitle={productFound.code}
          header={() => header(productFound.image)}
        >
          <section className="flex flex-col gap-2 text-lg">
            {statusBodyTemplate(productFound)}

            <div className="flex gap-2">
              <Tag severity="contrast">{productFound.category.name}</Tag>
              <Tag severity="warning">{productFound.brand.name}</Tag>
            </div>

            <div className="flex gap-2">
              <label htmlFor="sale_price">Precio de venta:</label>
              <span id="sale_price" className="font-extrabold">
                {productFound.sale_price} {currencySymbol}
              </span>
            </div>

            <div className="flex gap-2">
              <label htmlFor="stock_type">Tipo de stock:</label>
              <span id="stock_type" className="font-extrabold">
                {productFound.stock_type}
              </span>
            </div>

            <div className="flex gap-2">
              <label htmlFor="stock">Cantidad disponible:</label>
              <span id="stock" className="font-extrabold">
                {productFound.stock} pz
              </span>
            </div>

            <div className="flex gap-2">
              <span>{productFound.description}</span>
            </div>
          </section>
        </Card>
      )}
    </div>
  );
};

export default SearchProductForm;
