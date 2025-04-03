import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../../components/datatable/Table";
import LabelInput from "../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { IBrand } from "../../../utils/interfaces/Brand";
import { IProduct } from "../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { getStatus } from "../../order/utils/getStatus";
import useProductListWithParams from "../hooks/useProductListWithParams";

interface BrandDetailProps {
  brand: IBrand;
}

const BrandDetail: FC<BrandDetailProps> = ({ brand }) => {
  const { listProductWithParams, loadingListProductWithParams } =
    useProductListWithParams({ brandId: brand._id, categoryId: "" });

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

  const [columns] = useState<DataTableColumn<IProduct>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProduct) => (
        <Link
          className="underline hover:text-blue-300"
          to={`/product/Detail/${rowData._id}`}
        >
          {rowData.code}
        </Link>
      ),
    },
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "20%" },
    },
    {
      field: "category.name",
      header: "Categoria",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProduct) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.sale_price} ${currencySymbol}`}
        />
      ),
    },
    {
      field: "stock",
      header: "Stock",
      sortable: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "10%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductWithParams) {
    return <LoadingSpinner />;
  }

  return (
    // <div className="flex flex-col gap-2">
    //   <Card title={`${brand.name}`}>
    //     <p className="m-0">{brand.description}</p>
    //   </Card>
    //   <Card title={`Productos asociados (${listProductWithParams.length})`}>
    //     <Table
    //       columns={columns}
    //       data={listProductWithParams}
    //       emptyMessage="Sin productos."
    //       size="small"
    //       dataFilters={filters}
    //       tableHeader={renderFilterInput}
    //       editMode="row"
    //     />
    //   </Card>
    // </div>

    <div className="flex flex-col gap-2">
      <Card className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-800">{brand.name}</h2>
        <p className="text-gray-600 mt-2">{brand.description}</p>
      </Card>

      <Card className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Productos Asociados ({listProductWithParams.length})
          </h3>
        </div>

        <Table
          columns={columns}
          data={listProductWithParams}
          emptyMessage="Sin productos."
          size="small"
          tableHeader={renderFilterInput}
          dataFilters={filters}
          editMode="row"
        />
      </Card>
    </div>
  );
};

export default BrandDetail;
