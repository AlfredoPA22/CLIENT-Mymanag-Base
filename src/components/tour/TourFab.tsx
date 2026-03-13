import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTour } from "../../hooks/useTour";

const TourFab = () => {
  const { startTour } = useTour();
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-[500] flex items-center gap-2">
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          >
            Guía de esta página
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        onClick={startTour}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-12 h-12 rounded-full bg-[#A0C82E] text-white shadow-lg flex items-center justify-center text-xl font-bold hover:bg-[#8db526] transition-colors duration-150"
        aria-label="Guía de esta página"
      >
        ?
      </motion.button>
    </div>
  );
};

export default TourFab;
