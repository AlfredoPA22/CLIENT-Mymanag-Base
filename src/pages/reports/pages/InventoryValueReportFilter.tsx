import { useApolloClient } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useState } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_PRODUCT } from "../../../graphql/queries/Product";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IBrand } from "../../../utils/interfaces/Brand";
import { ICategory } from "../../../utils/interfaces/Category";
import { IFilterProductInput } from "../../../utils/interfaces/Product";
import useBrandList from "../../product/hooks/useBrandList";
import useCategoryList from "../../product/hooks/useCategoryList";
import { generateInventoryValueReportPDF } from "../utils/generateInventoryValueReportPDF";
import useAuth from "../../auth/hooks/useAuth";

interface InventoryValueReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const InventoryValueReportFilter: FC<InventoryValueReportFilterProps> = ({ setVisible }) => {
  const { listBrand, loadingListBrand } = useBrandList();
  const { listCategory, loadingListCategory } = useCategoryList();
  const { currency } = useAuth();

  const client = useApolloClient();

  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

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
      generateInventoryValueReportPDF(data.productReport, currency, {
        category: selectedCategory?.name,
        brand: selectedBrand?.name,
      });
      setVisible(false);
      resetForm();
    }
  };

  const handleBrandChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedBrand(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleCategoryChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedCategory(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const { handleSubmit, resetForm, values, errors, setFieldValue, isSubmitting } =
    useFormikForm({
      initialValues,
      msgSuccess: "Reporte Generado",
      handleSubmit: onSubmit,
    });

  if (loadingListBrand || loadingListCategory) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="grid xl:grid-cols-3 gap-2">
      <DropdownInput
        label="Categoría"
        name="category"
        optionLabel="name"
        placeholder="Todas las categorías"
        filter={true}
        showClear={true}
        options={listCategory}
        value={selectedCategory}
        error={errors.category ?? ""}
        onChange={handleCategoryChange}
      />

      <DropdownInput
        label="Marca"
        name="brand"
        optionLabel="name"
        placeholder="Todas las marcas"
        filter={true}
        showClear={true}
        options={listBrand}
        value={selectedBrand}
        error={errors.brand ?? ""}
        onChange={handleBrandChange}
      />

      <section className="flex justify-center items-center">
        <Button
          type="submit"
          severity="info"
          label="Generar reporte"
          disabled={isSubmitting}
        />
      </section>
    </form>
  );
};

export default InventoryValueReportFilter;
