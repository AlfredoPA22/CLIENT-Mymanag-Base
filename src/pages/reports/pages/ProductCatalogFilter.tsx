import { useApolloClient } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useState } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_PRODUCT } from "../../../graphql/queries/Product";
import useAuth from "../../auth/hooks/useAuth";
import useBrandList from "../../product/hooks/useBrandList";
import useCategoryList from "../../product/hooks/useCategoryList";
import { productStatusOptions } from "../../product/utils/productStatusMock";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IBrand } from "../../../utils/interfaces/Brand";
import { ICategory } from "../../../utils/interfaces/Category";
import { IFilterProductInput } from "../../../utils/interfaces/Product";
import { generateProductCatalogPDF } from "../utils/generateProductCatalogPDF";

interface ProductCatalogFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const ProductCatalogFilter: FC<ProductCatalogFilterProps> = ({ setVisible }) => {
  const { listBrand, loadingListBrand } = useBrandList();
  const { listCategory, loadingListCategory } = useCategoryList();
  const { currency } = useAuth();
  const client = useApolloClient();

  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const initialValues: IFilterProductInput = {
    brand: "",
    category: "",
    status: "Todos",
  };

  const onSubmit = async () => {
    const { data } = await client.query({
      query: REPORT_PRODUCT,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data) {
      await generateProductCatalogPDF(data.productReport, currency, {
        ...values,
        categoryName: selectedCategory?.name ?? "Todas",
        brandName: selectedBrand?.name ?? "Todas",
      });
      setVisible(false);
      resetForm();
    }
  };

  const handleBrandChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedBrand(value ?? null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleCategoryChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedCategory(value ?? null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleStatusChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedStatus(value ?? "");
    e.target.value = value ?? "";
    setFieldValue(e.target.name, e.target.value);
  };

  const { handleSubmit, resetForm, values, errors, setFieldValue, isSubmitting } =
    useFormikForm({
      initialValues,
      msgSuccess: "Catálogo generado",
      handleSubmit: onSubmit,
    });

  if (loadingListBrand || loadingListCategory) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500 leading-relaxed">
        Genera un catálogo visual con imágenes de los productos. Puedes
        filtrar por categoría, marca o estado, o dejarlo en blanco para incluir
        todos.
      </p>

      <form onSubmit={handleSubmit} className="grid xl:grid-cols-4 gap-2">
        <DropdownInput
          label="Marca"
          name="brand"
          optionLabel="name"
          placeholder="Seleccionar marca"
          filter={true}
          showClear={true}
          options={listBrand}
          value={selectedBrand}
          error={errors.brand ?? ""}
          onChange={handleBrandChange}
        />

        <DropdownInput
          label="Categoría"
          name="category"
          optionLabel="name"
          placeholder="Seleccionar categoría"
          filter={true}
          showClear={true}
          options={listCategory}
          value={selectedCategory}
          error={errors.category ?? ""}
          onChange={handleCategoryChange}
        />

        <DropdownInput
          label="Estado"
          name="status"
          optionLabel="label"
          placeholder="Seleccionar estado"
          mandatory
          options={productStatusOptions}
          value={selectedStatus}
          error={errors.status ?? ""}
          onChange={handleStatusChange}
        />

        <section className="flex justify-center items-center">
          <Button
            type="submit"
            severity="info"
            icon="pi pi-book"
            label={isSubmitting ? "Generando..." : "Generar catálogo"}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </section>
      </form>
    </div>
  );
};

export default ProductCatalogFilter;
