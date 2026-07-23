import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { QRCodeCanvas } from "qrcode.react";
import { FiCopy, FiDownload, FiExternalLink, FiUpload } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import SectionHeader from "../../components/sectionHeader/SectionHeader";
import useCompanySettings from "../settings/hooks/useCompanySettings";
import useAuth from "../auth/hooks/useAuth";
import { showToast } from "../../utils/toastUtils";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { STORE_ORDER_STATS } from "../../graphql/queries/SaleOrder";
import { IStoreOrderStats } from "../../utils/interfaces/SaleOrder";
import { uploadImage } from "../../utils/uploadImage";
import {
  generateThemeFromBaseColor,
  isValidHex,
  IStoreTheme,
  STORE_THEME_PRESETS,
} from "../../utils/storeTheme";

const DEFAULT_THEME = STORE_THEME_PRESETS[0].theme;

const StoreSettings = () => {
  const { company, loadingCompany, errorCompany, refetchCompany, loadingUpdate, saveCompany } =
    useCompanySettings();
  const { currency } = useAuth();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [baseColor, setBaseColor] = useState(
    company?.store_theme?.primary || DEFAULT_THEME.primary
  );
  const { data: statsData, loading: loadingStats } = useQuery<{
    storeOrderStats: IStoreOrderStats;
  }>(STORE_ORDER_STATS);
  const stats = statsData?.storeOrderStats;

  useEffect(() => {
    if (company?.store_theme?.primary) {
      setBaseColor(company.store_theme.primary);
    }
  }, [company?.store_theme?.primary]);

  if (loadingCompany) {
    return <LoadingSpinner />;
  }

  if (errorCompany || !company) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-gray-600">
            No se pudo cargar la configuración de la tienda.
          </p>
          <Button label="Reintentar" icon="pi pi-refresh" onClick={() => refetchCompany()} />
        </div>
      </div>
    );
  }

  const storeUrl = `${import.meta.env.VITE_STORE_BASE_URL}/${company.slug}`;

  const handleToggle = async (checked: boolean) => {
    await saveCompany({ store_enabled: checked });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(storeUrl);
    showToast({ detail: "Link copiado", severity: ToastSeverity.Success });
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-tienda-${company.slug}.png`;
    link.click();
  };

  const handleBannerSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        await saveCompany({ store_banner_image: url });
      }
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  const handleApplyTheme = async (theme: IStoreTheme) => {
    await saveCompany({ store_theme: theme });
  };

  const handleGenerateFromBase = async () => {
    if (!isValidHex(baseColor)) {
      showToast({
        detail: "Ingresa un color hexadecimal válido",
        severity: ToastSeverity.Error,
      });
      return;
    }
    await handleApplyTheme(generateThemeFromBaseColor(baseColor));
  };

  const activeTheme = company.store_theme?.primary ? company.store_theme : DEFAULT_THEME;
  const activePresetName = STORE_THEME_PRESETS.find(
    (p) => p.theme.primary.toLowerCase() === activeTheme.primary?.toLowerCase()
  )?.name;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <SectionHeader
        title="Tienda online"
        subtitle="Administra tu tienda pública de cara al cliente final"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Tienda habilitada</p>
            <p className="text-sm text-gray-500">
              Mientras esté desactivada, tu tienda pública no será accesible.
            </p>
          </div>
          <InputSwitch
            checked={!!company.store_enabled}
            disabled={loadingUpdate}
            onChange={(e) => handleToggle(!!e.value)}
          />
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-2">Link de tu tienda</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={storeUrl}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
            />
            <Button icon={<FiCopy />} outlined onClick={handleCopy} type="button" />
            <Button
              icon={<FiExternalLink />}
              outlined
              type="button"
              onClick={() => window.open(storeUrl, "_blank")}
            />
          </div>
          {!company.store_enabled && (
            <p className="text-xs text-amber-600 mt-2">
              Activa la tienda para que este link funcione.
            </p>
          )}
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-2">Código QR</p>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <QRCodeCanvas ref={qrRef} value={storeUrl} size={160} marginSize={2} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-3">
                Comparte este código para que tus clientes entren directo a tu tienda desde el celular.
              </p>
              <Button
                label="Descargar QR"
                icon={<FiDownload />}
                outlined
                type="button"
                onClick={handleDownloadQr}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-2">Banner de portada</p>
          <p className="text-sm text-gray-500 mb-3">
            Esta imagen se muestra como fondo del encabezado de tu tienda.
          </p>
          {company.store_banner_image && (
            <img
              src={company.store_banner_image}
              alt="Banner de la tienda"
              className="mb-3 h-32 w-full rounded-lg object-cover border border-gray-200"
            />
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <FiUpload />
            {uploadingBanner ? "Subiendo..." : "Cambiar banner"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingBanner}
              onChange={handleBannerSelect}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6 space-y-6">
        <div>
          <p className="font-semibold text-gray-800 mb-1">Colores de la tienda</p>
          <p className="text-sm text-gray-500">
            Elige una paleta lista para usar, o genera una a partir de un color propio.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Paletas predefinidas</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STORE_THEME_PRESETS.map((preset) => {
              const isActive = activePresetName === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  disabled={loadingUpdate}
                  onClick={() => handleApplyTheme(preset.theme)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? "border-[#A0C82E] ring-1 ring-[#A0C82E] bg-lime-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex -space-x-1 shrink-0">
                    {[preset.theme.primary, preset.theme.dark, preset.theme.light].map(
                      (color, idx) => (
                        <span
                          key={idx}
                          className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Color personalizado</p>
          <p className="text-xs text-gray-500 mb-3">
            Elige un color base y generamos automáticamente el resto de la paleta (botones, encabezado y acentos).
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={isValidHex(baseColor) ? baseColor : DEFAULT_THEME.primary}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              placeholder="#a0c82e"
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono uppercase"
            />
            <Button
              label="Generar tema"
              type="button"
              disabled={loadingUpdate}
              onClick={handleGenerateFromBase}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tema activo</p>
          <div className="flex items-center gap-2">
            {(
              [
                ["Principal", activeTheme.primary],
                ["Principal (hover)", activeTheme.primaryDark],
                ["Encabezado", activeTheme.dark],
                ["Encabezado (degradado)", activeTheme.darkLight],
                ["Acento secundario", activeTheme.light],
              ] as [string, string | undefined][]
            ).map(([label, color]) => (
              <span
                key={label}
                title={`${label}: ${color}`}
                className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6 space-y-6">
        <p className="font-semibold text-gray-800">Estadísticas de la tienda</p>

        {loadingStats || !stats ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Pedidos totales</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Pendientes</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {stats.totalRevenue.toLocaleString()} {currency}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ventas aprobadas</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(stats.averageTicket).toLocaleString()} {currency}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ticket promedio</p>
              </div>
            </div>

            {stats.topProducts.length > 0 && (
              <div>
                <p className="font-semibold text-gray-800 mb-2">Productos más vendidos</p>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {stats.topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <span className="text-gray-700">{p.product}</span>
                      <span className="text-gray-500">
                        {p.quantity} uds · {p.total.toLocaleString()} {currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreSettings;
