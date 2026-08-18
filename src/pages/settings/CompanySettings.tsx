import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { SelectButton } from "primereact/selectbutton";
import { useState } from "react";
import DropdownInput from "../../components/dropdownInput/DropdownInput";
import FieldNumberInput from "../../components/FieldNumberInput/FieldNumberInput";
import FieldSimpleFileUpload from "../../components/fileuploadInput/FileUploadInput";
import LabelInput from "../../components/labelInput/LabelInput";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import SectionHeader from "../../components/sectionHeader/SectionHeader";
import FieldTextareaInput from "../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../components/textInput/FieldTextInput";
import useAuth from "../auth/hooks/useAuth";
import { useFormikForm } from "../../hooks/useFormikForm";
import useCompanySettings from "./hooks/useCompanySettings";
import { ICompany, ICompanyInput } from "../../utils/interfaces/Company";
import { uploadImage } from "../../utils/uploadImage";
import { schemaCompanySettings } from "./validations/CompanySettingsValidation";
import { PLAN_LABELS, companyPlan } from "../../utils/enums/companyPlan.enum";
import { paymentExchangeRateSource } from "../../utils/enums/paymentExchangeRateSource.enum";
import { getDate } from "../order/utils/getDate";

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
];

interface CompanyFormProps {
  company: ICompany;
  canEdit: boolean;
  saveCompany: (input: ICompanyInput) => Promise<void>;
  loadingUpdate: boolean;
}

const CompanySettingsForm = ({ company, canEdit, saveCompany, loadingUpdate }: CompanyFormProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedFooterImage, setSelectedFooterImage] = useState<File | null>(null);

  const initialValues: ICompanyInput = {
    legal_name: company.legal_name ?? "",
    nit: company.nit ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
    country: company.country ?? "",
    currency: company.currency ?? "",
    exchange_rate: company.exchange_rate ?? null,
    payment_exchange_rate_source: company.payment_exchange_rate_source ?? paymentExchangeRateSource.ACTUAL,
    image: company.image ?? "",
    sale_pdf_footer_note: company.sale_pdf_footer_note ?? "",
    sale_pdf_footer_image: company.sale_pdf_footer_image ?? "",
  };

  const onSubmit = async () => {
    if (selectedImage) {
      const url = await uploadImage(selectedImage);
      values.image = url ?? values.image;
    }
    if (selectedFooterImage) {
      const url = await uploadImage(selectedFooterImage);
      values.sale_pdf_footer_image = url ?? values.sale_pdf_footer_image;
    }
    await saveCompany(values);
    resetForm({ values });
    setSelectedImage(null);
    setSelectedFooterImage(null);
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

  const handlePosModeToggle = async (checked: boolean) => {
    await saveCompany({ pos_sale_mode_enabled: checked });
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

  const onFooterImageSelect = (e: { files: File[] }) => {
    const file = e.files[0];
    setSelectedFooterImage(file);
    setFieldValue("sale_pdf_footer_image", file.name ?? "");
  };

  const handleFooterImageClear = () => {
    setSelectedFooterImage(null);
    setFieldValue("sale_pdf_footer_image", company.sale_pdf_footer_image ?? "");
  };

  const handleFooterImageRemove = () => {
    setSelectedFooterImage(null);
    setFieldValue("sale_pdf_footer_image", "");
  };

  const previewSrc = selectedImage
    ? URL.createObjectURL(selectedImage)
    : values.image || "";

  const footerImagePreviewSrc = selectedFooterImage
    ? URL.createObjectURL(selectedFooterImage)
    : values.sale_pdf_footer_image || "";

  const initials = (company.name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const isDirty = dirty || !!selectedImage || !!selectedFooterImage;

  const expiresAtRaw =
    company.plan === companyPlan.FREE
      ? company.trial_expires_at
      : company.subscription_expires_at;

  const expiresAt =
    expiresAtRaw && !isNaN(Number(expiresAtRaw))
      ? new Date(Number(expiresAtRaw))
      : null;

  const remainingDays = expiresAt
    ? Math.max(
        Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        0
      )
    : 0;

  const remainingDaysCls =
    remainingDays === 0
      ? "text-red-600"
      : remainingDays <= 3
      ? "text-red-600"
      : remainingDays <= 7
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <SectionHeader
        title="Personalización de Empresa"
        subtitle="Configurá los datos de tu empresa activa. Esta información se usará en los reportes PDF."
      />

      {/* Información de solo lectura */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {company.plan === companyPlan.FREE ? "Vence prueba" : "Vence plan"}
          </span>
          {expiresAt ? (
            <>
              <span className={`font-semibold ${remainingDaysCls}`}>
                {remainingDays === 0
                  ? "Vencido"
                  : `${remainingDays} día${remainingDays === 1 ? "" : "s"} restante${remainingDays === 1 ? "" : "s"}`}
              </span>
              <span className="text-xs text-gray-400">{getDate(expiresAt.getTime())}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-400">-</span>
          )}
        </div>
      </div>

      {/* Modo de venta rápida (POS) — toggle independiente, se guarda al instante, no depende del botón "Guardar cambios" del form de abajo */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-md">
            <p className="font-semibold text-gray-800">Modo de venta rápida (POS)</p>
            <p className="text-sm text-gray-500">
              Habilita una segunda forma de armar ventas, tipo mostrador: tocar tarjetas de producto en vez de llenar un formulario línea por línea.
            </p>
          </div>
          <InputSwitch
            className="shrink-0 mt-1"
            checked={!!company.pos_sale_mode_enabled}
            disabled={!canEdit || loadingUpdate}
            onChange={(e) => handlePosModeToggle(!!e.value)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
          {values.currency === "$" && (
            <FieldNumberInput
              label="Tipo de cambio (Bs por $)"
              name="exchange_rate"
              mandatory
              placeholder="Ej. 6.96"
              value={values.exchange_rate ?? null}
              error={errors.exchange_rate}
              onChange={(e) => setFieldValue("exchange_rate", e.value ?? null)}
              disabled={!canEdit}
              minFractionDigits={2}
              maxFractionDigits={4}
            />
          )}
          {values.currency === "$" && (
            <div className="sm:col-span-2">
              <LabelInput name="payment_exchange_rate_source" label="Tipo de cambio a usar en los pagos en Bs" />
              <SelectButton
                value={values.payment_exchange_rate_source}
                options={[
                  { label: "El actual de la empresa", value: paymentExchangeRateSource.ACTUAL },
                  { label: "El de la nota que se paga", value: paymentExchangeRateSource.NOTA },
                ]}
                onChange={(e) => e.value && setFieldValue("payment_exchange_rate_source", e.value)}
                disabled={!canEdit}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                {values.payment_exchange_rate_source === paymentExchangeRateSource.NOTA
                  ? "Un pago en Bs se convierte con el tipo de cambio que tenía la venta cuando se creó, no con el de hoy."
                  : "Un pago en Bs se convierte con el tipo de cambio vigente en la empresa al momento de pagar, sin importar cuándo se creó la venta."}
              </p>
            </div>
          )}
        </div>

        {/* Pie de página del PDF de ventas */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Pie de página del PDF de ventas</span>
            <p className="text-xs text-gray-500">
              Texto y/o imagen que se agregan al final del PDF de la nota de venta (garantía, términos, redes, un sello, etc.). Se deja en blanco si no se configura nada.
            </p>
          </div>

          <FieldTextareaInput
            label="Texto del pie de página (opcional)"
            name="sale_pdf_footer_note"
            placeholder="Ej: Garantía de 6 meses. Consultas al 700-00000."
            value={values.sale_pdf_footer_note ?? ""}
            rows={3}
            cols={30}
            error={errors.sale_pdf_footer_note}
            onChange={handleChange}
            disabled={!canEdit}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">Imagen del pie de página (opcional)</span>
            <div className="flex items-center gap-4 flex-wrap">
              {footerImagePreviewSrc && (
                <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-100 shadow-sm flex-shrink-0">
                  <img src={footerImagePreviewSrc} alt="Pie de página" className="w-full h-full object-contain" />
                </div>
              )}

              {canEdit && (
                <div className="flex flex-col gap-2">
                  {!selectedFooterImage && (
                    <FieldSimpleFileUpload
                      id="sale_pdf_footer_image"
                      label=""
                      name="sale_pdf_footer_image"
                      chooseLabel={footerImagePreviewSrc ? "Cambiar imagen" : "Subir imagen"}
                      mode="basic"
                      auto={false}
                      customUpload
                      accept="image/*"
                      maxFileSize={5000000}
                      onSelect={onFooterImageSelect}
                      onFileClear={handleFooterImageClear}
                      file={selectedFooterImage}
                      style={{ display: "block" }}
                    />
                  )}
                  {selectedFooterImage && (
                    <Button
                      type="button"
                      label="Quitar selección"
                      icon="pi pi-times"
                      severity="secondary"
                      text
                      size="small"
                      onClick={handleFooterImageClear}
                    />
                  )}
                  {!selectedFooterImage && footerImagePreviewSrc && (
                    <Button
                      type="button"
                      label="Quitar imagen"
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      size="small"
                      onClick={handleFooterImageRemove}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
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
  const { company, loadingCompany, errorCompany, refetchCompany, saveCompany, loadingUpdate } =
    useCompanySettings();

  const canEdit = permissions.includes("UPDATE_COMPANY");

  if (loadingCompany) return <LoadingSpinner />;

  if (errorCompany || !company) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-gray-600">
            No se pudo cargar la información de la empresa.
          </p>
          <Button label="Reintentar" icon="pi pi-refresh" onClick={() => refetchCompany()} />
        </div>
      </div>
    );
  }

  return (
    <CompanySettingsForm
      company={company}
      canEdit={canEdit}
      saveCompany={saveCompany}
      loadingUpdate={loadingUpdate}
    />
  );
};

export default CompanySettings;
