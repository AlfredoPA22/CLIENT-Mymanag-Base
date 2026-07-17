import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import GlobalSearchModal from "../globalSearch/GlobalSearchModal";
import NotificationBell from "../notifications/NotificationBell";

interface SearchAndNotificationsProps {
  // "dark" se usa cuando el componente se incrusta sobre un fondo oscuro
  // (p.ej. la fila de saludo de Inicio, con el mismo color que el sidebar).
  variant?: "light" | "dark";
}

// Buscador global (Ctrl+K) + campana de notificaciones, extraído de TopBar
// para poder incrustarlo también en la fila de saludo de Inicio, sin duplicar
// el listener de teclado ni el modal de búsqueda.
const SearchAndNotifications = ({ variant = "light" }: SearchAndNotificationsProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const isDark = variant === "dark";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey;
      if (modifierPressed && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className={
          isDark
            ? "flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            : "flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        }
      >
        <FiSearch size={14} />
        Buscar...
        <span
          className={
            isDark
              ? "ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400"
              : "ml-2 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400"
          }
        >
          Ctrl+K
        </span>
      </button>

      <NotificationBell
        buttonClassName={
          isDark
            ? "relative flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:bg-white/10"
            : undefined
        }
      />

      <GlobalSearchModal visible={searchOpen} onHide={() => setSearchOpen(false)} />
    </>
  );
};

export default SearchAndNotifications;
