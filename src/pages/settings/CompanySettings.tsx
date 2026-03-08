import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";
import DropdownInput from "../../components/dropdownInput/DropdownInput";
import FieldSimpleFileUpload from "../../components/fileuploadInput/FileUploadInput";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import SectionHeader from "../../components/sectionHeader/SectionHeader";
import FieldTextInput from "../../components/textInput/FieldTextInput";
import useAuth from "../auth/hooks/useAuth";
import { useFormikForm } from "../../hooks/useFormikForm";
import useCompanySettings from "./hooks/useCompanySettings";
import { ICompany, ICompanyInput } from "../../utils/interfaces/Company";
import { uploadImage } from "../../utils/uploadImage";
import { schemaCompanySettings } from "./validations/CompanySettingsValidation";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratis",
  BASIC: "Básico",
  PRO: "Pro",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  PENDING: "Pendiente",
};

const COUNTRY_OPTIONS = [
  { label: "Argentina", value: "Argentina" },
  { label: "Bolivia", value: "Bolivia" },
  { label: "Chile", value: "Chile" },
  { label: "Colombia", value: "Colombia" },
  { label: "Costa Rica", value: "Costa Rica" },
  { label: "Cuba", value: "Cuba" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "El Salvador", value: "El Salvador" },
  { label: "España", value: "España" },
  { label: "Estados Unidos", value: "Estados Unidos" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Honduras", value: "Honduras" },
  { label: "México", value: "México" },
  { label: "Nicaragua", value: "Nicaragua" },
  { label: "Panamá", value: "Panamá" },
  { label: "Paraguay", value: "Paraguay" },
  { label: "Perú", value: "Perú" },
  { label: "República Dominicana", value: "República Dominicana" },
  { label: "Uruguay", value: "Uruguay" },
  { label: "Venezuela", value: "Venezuela" },
];

const CURRENCY_OPTIONS = [
  { label: "Bs — Boliviano (Bolivia)", value: "Bs" },
  { label: "$ — Dólar estadounidense", value: "$" },
  { label: "€ — Euro", value: "€" },
  { label: "COP — Peso colombiano", value: "COP" },
  { label: "MXN — Peso mexicano", value: "MXN" },
  { label: "S/ — Sol peruano", value: "S/" },
  { label: "CLP — Peso chileno", value: "CLP" },
  { label: "ARS — Peso argentino", value: "ARS" },
  { label: "GTQ — Quetzal guatemalteco", value: "GTQ" },
  { label: "HNL — Lempira hondureño", value: "HNL" },
  { label: "NIO — Córdoba nicaragüense", value: "NIO" },
  { label: "DOP — Peso dominicano", value: "DOP" },
  { label: "PAB — Balboa panameño", value: "PAB" },
  { label: "CRC — Colón costarricense", value: "CRC" },
  { label: "PYG — Guaraní paraguayo", value: "PYG" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
  { label: "VES — Bolívar venezolano", value: "VES" },
];

interface CompanyFormProps {
  company: ICompany;
  canEdit: boolean;
  saveCompany: (input: ICompanyInput) => Promise<void>;
}

const CompanySettingsForm = ({ company, canEdit, saveCompany }: CompanyFormProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const initialValues: ICompanyInput = {
    legal_name: company.legal_name ?? "",
    nit: company.nit ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
    country: company.country ?? "",
    currency: company.currency ?? "",
    image: company.image ?? "",
  };

  const onSubmit = async () => {
    if (selectedImage) {
      const url = await uploadImage(selectedImage);
      values.image = url ?? values.image;
    }
    await saveCompany(values);
    resetForm({ values });
    setSelectedImage(null);
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    dirty,
    isSubmitting,
    setFieldValue,
  } = useFormikForm<ICompanyInput>({
    initialValues,
    handleSubmit: onSubmit,
    validationSchema: schemaCompanySettings,
  });

  const handleDropdown = (e: DropdownChangeEvent) => {
    setFieldValue(e.target.name, e.value);
  };

  const onFileSelect = (e: { files: File[] }) => {
    const file = e.files[0];
    setSelectedImage(file);
    setFieldValue("image", file.name ?? "");
  };

  const handleFileClear = () => {
    setSelectedImage(null);
    setFieldValue("image", company.image ?? "");
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setFieldValue("image", "");
  };

  const previewSrc = selectedImage
    ? URL.createObjectURL(selectedImage)
    : values.image || "";

  const initials = (company.name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const isDirty = dirty || !!selectedImage;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <SectionHeader
        title="Personalización de Empresa"
        subtitle="Configurá los datos de tu empresa activa. Esta información se usará en los reportes PDF."
      />

      {/* Información de solo lectura */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Empresa</span>
          <span className="font-semibold text-gray-800">{company.name ?? "-"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Plan</span>
          <span className="font-semibold text-gray-800">
            {PLAN_LABELS[company.plan ?? ""] ?? company.plan ?? "-"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Estado</span>
          <span
            className={`font-semibold ${
              company.status === "ACTIVE" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {STATUS_LABELS[company.status ?? ""] ?? company.status ?? "-"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Logo */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-700">Logo de la empresa</span>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Preview */}
            <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-100 shadow-sm flex-shrink-0">
              {previewSrc ? (
                <img src={previewSrc} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">{initials || "?"}</span>
              )}
            </div>

            {canEdit && (
              <div className="flex flex-col gap-2">
                {!selectedImage && (
                  <FieldSimpleFileUpload
                    id="image"
                    label=""
                    name="image"
                    chooseLabel="Subir logo"
                    mode="basic"
                    auto={false}
                    customUpload
                    accept="image/*"
                    maxFileSize={5000000}
                    onSelect={onFileSelect}
                    onFileClear={handleFileClear}
                    file={selectedImage}
                    style={{ display: "block" }}
                  />
                )}
                {selectedImage && (
                  <Button
                    type="button"
                    label="Quitar selección"
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    size="small"
                    onClick={handleFileClear}
                  />
                )}
                {!selectedImage && values.image && (
                  <Button
                    type="button"
                    label="Quitar imagen"
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    size="small"
                    onClick={handleImageRemove}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Campos editables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldTextInput
            label="Razón social"
            name="legal_name"
            type="text"
            placeholder="Razón social"
            mandatory
            value={values.legal_name ?? ""}
            error={errors.legal_name}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <FieldTextInput
            label="NIT / RUC"
            name="nit"
            type="text"
            placeholder="NIT / RUC"
            mandatory
            value={values.nit ?? ""}
            error={errors.nit}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <FieldTextInput
            label="Correo de contacto"
            name="email"
            type="email"
            placeholder="correo@empresa.com"
            mandatory
            value={values.email ?? ""}
            error={errors.email}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <FieldTextInput
            label="Teléfono"
            name="phone"
            type="text"
            placeholder="Teléfono"
            mandatory
            value={values.phone ?? ""}
            error={errors.phone}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <FieldTextInput
            label="Dirección"
            name="address"
            type="text"
            placeholder="Dirección"
            mandatory
            value={values.address ?? ""}
            error={errors.address}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <DropdownInput
            label="País"
            name="country"
            placeholder="Seleccionar país"
            mandatory
            options={COUNTRY_OPTIONS}
            optionLabel="label"
            optionValue="value"
            value={values.country}
            error={errors.country}
            onChange={handleDropdown}
            disabled={!canEdit}
            filter
          />
          <DropdownInput
            label="Moneda"
            name="currency"
            placeholder="Seleccionar moneda"
            mandatory
            options={CURRENCY_OPTIONS}
            optionLabel="label"
            optionValue="value"
            value={values.currency}
            error={errors.currency}
            onChange={handleDropdown}
            disabled={!canEdit}
            filter
          />
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <Button
              type="submit"
              severity="success"
              label="Guardar cambios"
              icon="pi pi-check"
              disabled={!isDirty || isSubmitting}
              loading={isSubmitting}
            />
          </div>
        )}
      </form>
    </div>
  );
};

const CompanySettings = () => {
  const { permissions } = useAuth();
  const { company, loadingCompany, saveCompany } = useCompanySettings();

  const canEdit = permissions.includes("UPDATE_COMPANY");

  if (loadingCompany || !company) return <LoadingSpinner />;

  return (
    <CompanySettingsForm
      company={company}
      canEdit={canEdit}
      saveCompany={saveCompany}
    />
  );
};

export default CompanySettings;
