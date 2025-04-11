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
    <div className="flex flex-col p-5 rounded-lg gap-5">
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col md:flex-row gap-4 justify-center ${
          errors.serial ? "items-center" : "items-end"
        }`}
      >
        <FieldTextInput
        className="sm:w-[400px]"
          role="input-name"
          label="Buscar producto"
          type="text"
          name="serial"
          placeholder="Ingresar codigo, nombre o serial"
          value={values.serial}
          error={errors.serial ? errors.serial : ""}
          onChange={handleChange}
        />

        <Button
          type="submit"
          severity="success"
          label="Buscar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </form>

      {productFound && <ProductCard productData={productFound} />}
    </div>
  );
};

export default SearchProductForm;
