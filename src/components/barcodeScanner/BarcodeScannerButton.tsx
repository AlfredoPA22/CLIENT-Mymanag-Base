import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useCallback, useRef, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import { ToastSeverity } from "../../utils/enums/toast.enum";

interface BarcodeScannerButtonProps {
  onScan: (value: string) => void;
  className?: string;
}

// Solo tiene sentido en celular: en escritorio el lector físico ya funciona
// "escribiendo" el código en cualquier input enfocado, sin necesitar esto.
const BarcodeScannerButton = ({ onScan, className = "" }: BarcodeScannerButtonProps) => {
  const [open, setOpen] = useState(false);
  const controlsRef = useRef<IScannerControls | null>(null);
  // React 18 no soporta que una ref callback devuelva una función de limpieza
  // (eso recién llegó en React 19), así que esta bandera es lo que evita que
  // un resultado o error que llega tarde (después de cerrar el diálogo)
  // reactive algo o deje la cámara encendida sin que nadie la detenga.
  const activeRef = useRef(false);

  const stopScanning = useCallback(() => {
    activeRef.current = false;
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  // Ref de callback: se dispara justo cuando el <video> se monta (con el nodo)
  // o se desmonta (con null). Un useEffect + useRef normal puede correr antes
  // de que el Dialog termine de montar el video, dejando la cámara "colgada"
  // sin destino real — eso es lo que se veía como pantalla negra.
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) {
        stopScanning();
        return;
      }

      activeRef.current = true;
      const reader = new BrowserMultiFormatReader();

      reader
        .decodeFromConstraints(
          { video: { facingMode: "environment" } },
          video,
          (result, _error, controls) => {
            if (!activeRef.current) {
              controls.stop();
              return;
            }
            controlsRef.current = controls;
            if (!result) return;

            controls.stop();
            onScan(result.getText());
            setOpen(false);
          }
        )
        .catch(() => {
          if (!activeRef.current) return;
          showToast({
            detail: "No se pudo acceder a la cámara del dispositivo",
            severity: ToastSeverity.Error,
          });
          setOpen(false);
        });
    },
    [onScan, stopScanning]
  );

  return (
    <>
      <Button
        type="button"
        icon="pi pi-camera"
        outlined
        aria-label="Escanear con cámara"
        className={`md:hidden ${className}`}
        onClick={() => setOpen(true)}
      />

      <Dialog
        header="Escanear código"
        visible={open}
        onHide={() => {
          stopScanning();
          setOpen(false);
        }}
        className="w-[95vw] sm:w-[420px]"
      >
        {open && (
          <video
            ref={attachVideo}
            className="aspect-square w-full rounded-lg bg-black object-cover"
            autoPlay
            muted
            playsInline
          />
        )}
        <p className="text-center text-xs text-gray-400 mt-3">
          Apunta la cámara al código de barras del producto
        </p>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton;
