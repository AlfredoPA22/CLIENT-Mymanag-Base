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
import { productStatusOptions } from "../../product/utils/productStatusMock";
import { generateProductReportPDF } from "../utils/generateProductReportPDF";
import useAuth from "../../auth/hooks/useAuth";

interface ProductReportFilterProps {
  setVisibleProductFilter: (isVisible: boolean) => void;
}

const ProductReportFilter: FC<ProductReportFilterProps> = ({
  setVisibleProductFilter,
}) => {
  const { listBrand, loadingListBrand } = useBrandList();
  const { listCategory, loadingListCategory } = useCategoryList();
  const { currency } = useAuth();

  const client = useApolloClient();

  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
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
      const reportFilters = {
        brand: selectedBrand?.name || "Todos",
        category: selectedCategory?.name || "Todos",
        status: values.status,
      };
      generateProductReportPDF(data.productReport, currency, reportFilters);
      setVisibleProductFilter(false);
      resetForm();
    }
  };

  const handleBrandChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedBrand(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleCategoryChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedCategory(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleStatusChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedStatus(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleSubmit,
    resetForm,
    values,
    errors,
    setFieldValue,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Reporte Generado",
    handleSubmit: onSubmit,
  });

  if (loadingListBrand || loadingListCategory) {
    return <LoadingSpinner />;
  }
  return (
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
        error={errors.brand ? errors.brand : ""}
        onChange={handleBrandChange}
      />

      <DropdownInput
        label="Categoria"
        name="category"
        optionLabel="name"
        placeholder="Seleccionar categoria"
        filter={true}
        showClear={true}
        options={listCategory}
        value={selectedCategory}
        error={errors.category ? errors.category : ""}
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
        error={errors.status ? errors.status : ""}
        onChange={handleStatusChange}
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

export default ProductReportFilter;
