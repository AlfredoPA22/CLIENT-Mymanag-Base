import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current!,
        (result, _error, controls) => {
          controlsRef.current = controls;
          if (cancelled || !result) return;

          controls.stop();
          onScan(result.getText());
          setOpen(false);
        }
      )
      .catch(() => {
        if (cancelled) return;
        showToast({
          detail: "No se pudo acceder a la cámara del dispositivo",
          severity: ToastSeverity.Error,
        });
        setOpen(false);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open]);

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
        onHide={() => setOpen(false)}
        className="w-[95vw] sm:w-[420px]"
      >
        <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
        <p className="text-center text-xs text-gray-400 mt-3">
          Apunta la cámara al código de barras del producto
        </p>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton;
