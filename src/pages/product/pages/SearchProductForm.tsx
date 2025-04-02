import { useApolloClient } from "@apollo/client";
import { Button } from "primereact/button";
import { useState } from "react";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { SEARCH_PRODUCT } from "../../../graphql/queries/Product";
import { useFormikForm } from "../../../hooks/useFormikForm";
import {
  IProduct,
  ISearchProductInput,
} from "../../../utils/interfaces/Product";
import { schemaFormSearchProduct } from "../validations/FormSearchProductValidation";
import ProductCard from "./ProductCard";

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

      {productFound && <ProductCard productData={productFound} />}
    </div>
  );
};

export default SearchProductForm;
