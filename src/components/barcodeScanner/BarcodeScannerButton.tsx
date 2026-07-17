import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "../../utils/toastUtils";
import { ToastSeverity } from "../../utils/enums/toast.enum";

interface BarcodeScannerButtonProps {
  onScan: (value: string) => void;
  className?: string;
}

const MIN_BOX = 60;
const MAX_BOX_WIDTH = 320;
const MAX_BOX_HEIGHT = 220;
const DEFAULT_BOX = { width: 240, height: 100 };

// Solo tiene sentido en celular: en escritorio el lector físico ya funciona
// "escribiendo" el código en cualquier input enfocado, sin necesitar esto.
const BarcodeScannerButton = ({ onScan, className = "" }: BarcodeScannerButtonProps) => {
  const [open, setOpen] = useState(false);
  const [boxSize, setBoxSize] = useState(DEFAULT_BOX);
  const boxSizeRef = useRef(boxSize);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  // React 18 no soporta que una ref callback devuelva una función de limpieza
  // (eso recién llegó en React 19), así que esta bandera evita que un frame
  // que se estaba procesando siga reactivando algo después de cerrar el diálogo.
  const activeRef = useRef(false);

  useEffect(() => {
    boxSizeRef.current = boxSize;
  }, [boxSize]);

  const stopScanning = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Ref de callback: se dispara justo cuando el <video> se monta (con el nodo)
  // o se desmonta (con null). Un useEffect + useRef normal puede correr antes
  // de que el Dialog termine de montar el video, dejando la cámara "colgada"
  // sin destino real (pantalla negra).
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) {
        stopScanning();
        return;
      }

      activeRef.current = true;
      readerRef.current = new BrowserMultiFormatReader();

      const scanFrame = () => {
        if (!activeRef.current) return;

        if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          // Recorta el frame actual del video a la zona que el usuario definió
          // (el recuadro ajustable), y solo decodifica ESA región — no el
          // cuadro completo de la cámara.
          const rect = video.getBoundingClientRect();
          const scale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
          const renderedW = video.videoWidth * scale;
          const renderedH = video.videoHeight * scale;
          const offsetX = (rect.width - renderedW) / 2;
          const offsetY = (rect.height - renderedH) / 2;

          const { width: boxW, height: boxH } = boxSizeRef.current;
          const boxLeft = (rect.width - boxW) / 2;
          const boxTop = (rect.height - boxH) / 2;

          const sx = Math.max(0, (boxLeft - offsetX) / scale);
          const sy = Math.max(0, (boxTop - offsetY) / scale);
          const sw = Math.min(video.videoWidth - sx, boxW / scale);
          const sh = Math.min(video.videoHeight - sy, boxH / scale);

          if (sw > 0 && sh > 0) {
            const canvas = canvasRef.current ?? document.createElement("canvas");
            canvasRef.current = canvas;
            canvas.width = Math.round(sw);
            canvas.height = Math.round(sh);
            const ctx = canvas.getContext("2d");

            if (ctx) {
              ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
              try {
                const result = readerRef.current!.decodeFromCanvas(canvas);
                if (result) {
                  onScan(result.getText());
                  setOpen(false);
                  return;
                }
              } catch {
                // NotFoundException (no hay código en esta zona todavía) y
                // errores de checksum por movimiento son normales en casi
                // todos los frames — se ignoran y se sigue intentando.
              }
            }
          }
        }

        rafRef.current = requestAnimationFrame(scanFrame);
      };

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (!activeRef.current) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          streamRef.current = stream;
          video.srcObject = stream;
          return video.play().then(() => {
            if (activeRef.current) scanFrame();
          });
        })
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

  const handleResizeStart = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: boxSize.width,
      startH: boxSize.height,
    };
  };

  const handleResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();

    const dx = (e.clientX - drag.startX) * 2;
    const dy = (e.clientY - drag.startY) * 2;

    setBoxSize({
      width: Math.min(MAX_BOX_WIDTH, Math.max(MIN_BOX, drag.startW + dx)),
      height: Math.min(MAX_BOX_HEIGHT, Math.max(MIN_BOX, drag.startH + dy)),
    });
  };

  const handleResizeEnd = () => {
    dragRef.current = null;
  };

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
          <div className="relative">
            <video
              ref={attachVideo}
              className="aspect-[4/3] w-full rounded-lg bg-black object-cover"
              autoPlay
              muted
              playsInline
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-primary"
              style={{
                width: boxSize.width,
                height: boxSize.height,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
              }}
            >
              <div
                onPointerDown={handleResizeStart}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                className="pointer-events-auto absolute -bottom-2 -right-2 flex h-7 w-7 touch-none select-none items-center justify-center rounded-full border-2 border-white bg-primary shadow cursor-nwse-resize"
              >
                <i className="pi pi-arrows-alt text-[10px] text-white" />
              </div>
            </div>
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-3">
          Arrastra la esquina del recuadro para ajustar el tamaño de la zona de escaneo
        </p>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton;
