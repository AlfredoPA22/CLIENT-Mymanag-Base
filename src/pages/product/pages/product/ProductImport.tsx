import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../../../components/datatable/Table";
import { getToken } from "../../../../redux/accessors/auth.accessor";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPreviewProductImport } from "../../../../utils/interfaces/Product";
import { showToast } from "../../../../utils/toastUtils";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { Card } from "primereact/card";
import { useMutation } from "@apollo/client";
import { SAVE_IMPORT_PRODUCTS } from "../../../../graphql/mutations/Product";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { confirmDialog } from "primereact/confirmdialog";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";

const ProductImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<IPreviewProductImport[]>([]);
  const fileUploadRef = useRef<FileUpload>(null);

  const token = useSelector(getToken);
  const dispatch = useDispatch();

  const [saveImportProductsMutation] = useMutation(SAVE_IMPORT_PRODUCTS);

  const handleSelect = (e: FileUploadSelectEvent) => {
    const selectedFile = e.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview([]);
    }
  };

  const resetFileInput = () => {
    setFile(null);
    setPreview([]);
    fileUploadRef.current?.clear(); // limpia visualmente el FileUpload
  };

  const handlePreview = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      dispatch(setIsBlocked(true));
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload-preview`,
        {
          method: "POST",
          headers: {
            Authorization: `${token || ""}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Error en la carga");

      setPreview(result);
    } catch (error: any) {
      showToast({
        detail: error.message || "Error al previsualizar productos",
        severity: ToastSeverity.Error,
      });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleSaveImportProducts = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await saveImportProductsMutation({
        variables: {
          importProducts: preview,
        },
      });

      if (data) {
        showToast({
          detail: "Productos creados",
          severity: ToastSeverity.Success,
        });
        setPreview([]);
        setFile(null);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmSaveImportProducts = async () => {
    confirmDialog({
      message:
        "¿Está seguro que desea guardar estos productos importados?\n\nSi las marcas o categorías no existen, se crearán automáticamente.\n\n⚠️ Este proceso puede demorar. No cierre ni recargue la página durante el proceso, ya que los productos no se guardarán.",
      header: "Confirmación de importación",
      icon: "pi pi-question-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-success",
      acceptLabel: "Continuar",
      accept: () => handleSaveImportProducts(),
      className: "max-w-lg whitespace-pre-wrap", // 👈 Tailwind aplicado
    });
  };

  const tableHeaderTemplate = () => {
    const allValid =
      preview.length > 0 && preview.every((item) => item.isValid);

    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Previsualizacion de productos (${preview.length})`}</h1>

        <div className="flex gap-2">
          <Button
            label="Guardar"
            severity="success"
            tooltip="Guardar productos"
            tooltipOptions={{ position: "left" }}
            disabled={!allValid}
            onClick={confirmSaveImportProducts}
            raised
          />
        </div>
      </div>
    );
  };

  const [columns] = useState<DataTableColumn<IPreviewProductImport>[]>([
    { field: "row", header: "Nro" },
    { field: "code", header: "Código" },
    { field: "name", header: "Nombre" },
    { field: "brand", header: "Marca" },
    { field: "category", header: "Categoría" },
    { field: "description", header: "Descripcion" },
    { field: "sale_price", header: "Precio" },
    { field: "stock_type", header: "Tipo de stock" },
    { field: "min_stock", header: "Stock Min" },
    { field: "max_stock", header: "Stock Max" },
    {
      field: "isValid",
      header: "Validez",
      body: (rowData: IPreviewProductImport) => (
        <Tag
          value={rowData.isValid ? "Válido" : "Inválido"}
          severity={rowData.isValid ? "success" : "danger"}
        />
      ),
    },
    {
      field: "errors",
      header: "Errores",
      body: (rowData: IPreviewProductImport) =>
        rowData.errors.length > 0 ? (
          <ul className="text-red-500 text-sm list-disc pl-4">
            {rowData.errors.map((e) => (
              <li key={`${rowData.row}-${e}`}>{e}</li>
            ))}
          </ul>
        ) : (
          "-"
        ),
    },
  ]);

  return (
    <Card className="py-2" title="Importar Productos">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
        {/* Izquierda: selector y previsualizar */}
        <div className="flex flex-wrap gap-4">
          {/* Grupo de archivo + reiniciar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FileUpload
                ref={fileUploadRef}
                name="file"
                customUpload
                mode="basic"
                accept=".xlsx,.xls"
                auto={false}
                chooseLabel="Seleccionar archivo"
                className="p-button-sm p-button-outlined p-button-info"
                onSelect={handleSelect}
              />
              {file && (
                <Button
                  label="Reiniciar"
                  icon="pi pi-refresh"
                  severity="warning"
                  className="p-button-sm"
                  onClick={resetFileInput}
                />
              )}
            </div>
          </div>

          {/* Botón de previsualización */}
          <div className="flex items-center">
            <Button
              label="Previsualizar"
              icon="pi pi-eye"
              disabled={!file}
              onClick={handlePreview}
              severity="info"
              className="p-button-sm"
            />
          </div>
        </div>

        {/* Derecha: botón de descarga */}
        <div className="flex items-center">
          <Button
            label="Descargar plantilla"
            icon="pi pi-download"
            severity="secondary"
            className="p-button-sm"
            onClick={() => {
              window.open(
                "https://res.cloudinary.com/dbt5vgimv/raw/upload/v1750122698/MyManag/assets/template_products.xlsx",
                "_blank"
              );
            }}
          />
        </div>
      </div>

      {preview.length > 0 && (
        <Card className="py-2" header={tableHeaderTemplate}>
          <Table
            columns={columns}
            data={preview}
            size="small"
            emptyMessage="No hay productos cargados."
          />
        </Card>
      )}
    </Card>
  );
};

export default ProductImport;
