import { motion } from "framer-motion";
import { useFullProcessTour } from "../../hooks/useFullProcessTour";
import { useTour } from "../../hooks/useTour";

interface GuideCard {
  emoji: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  onStart: () => void;
}

const GuidesSection = () => {
  const { startPurchaseTour, startSaleTour, startTransferTour } = useFullProcessTour();
  const { schedulePageTour } = useTour();

  const guides: GuideCard[] = [
    {
      emoji: "🛒",
      title: "Proceso de compra",
      description:
        "Aprende a registrar productos, agregar proveedores y crear órdenes de compra para ingresar stock al sistema.",
      badge: "3 pasos",
      badgeColor: "bg-blue-100 text-blue-700",
      onStart: startPurchaseTour,
    },
    {
      emoji: "💰",
      title: "Proceso de venta",
      description:
        "Aprende a registrar clientes y crear órdenes de venta. El stock se descuenta automáticamente al aprobar.",
      badge: "2 pasos",
      badgeColor: "bg-green-100 text-green-700",
      onStart: startSaleTour,
    },
    {
      emoji: "🔄",
      title: "Transferencia de productos",
      description:
        "Aprende a configurar almacenes y transferir productos entre ellos para redistribuir tu inventario.",
      badge: "2 pasos",
      badgeColor: "bg-purple-100 text-purple-700",
      onStart: startTransferTour,
    },
    {
      emoji: "📦",
      title: "Gestión de inventario",
      description:
        "Conoce cómo administrar tus productos, filtrar por categoría, marca o almacén y detectar bajo stock.",
      badge: "1 módulo",
      badgeColor: "bg-orange-100 text-orange-700",
      onStart: () => schedulePageTour("/inventario/productos"),
    },
    {
      emoji: "📊",
      title: "Panel de reportes",
      description:
        "Descubre cómo generar reportes de productos, compras y ventas, y exportarlos en PDF.",
      badge: "1 módulo",
      badgeColor: "bg-slate-100 text-slate-600",
      onStart: () => schedulePageTour("/reportes"),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎓</span>
        <h2 className="text-lg font-bold text-slate-800">Guías del sistema</h2>
        <span className="text-xs text-slate-400 font-normal ml-1">
          — aprende a usar cada módulo paso a paso
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {guides.map((guide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none">{guide.emoji}</span>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">
                  {guide.title}
                </h3>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${guide.badgeColor}`}
              >
                {guide.badge}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed flex-grow">
              {guide.description}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={guide.onStart}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-[#A0C82E] text-white hover:bg-[#8db526] transition-colors duration-150 shadow-sm"
            >
              ▶ Iniciar guía
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GuidesSection;
