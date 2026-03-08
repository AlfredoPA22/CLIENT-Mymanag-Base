import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import useAuth from "../../pages/auth/hooks/useAuth";

interface SidebarMenuItemProps {
  item: any;
  handleNavigate: (to: string) => void;
  location: any;
  collapsed?: boolean;
}

export const SidebarMenuItem = ({
  item,
  handleNavigate,
  location,
  collapsed = false,
}: SidebarMenuItemProps) => {
  const [open, setOpen] = useState(false);
  const { permissions } = useAuth();

  const isActive =
    item.to &&
    (location.pathname === item.to ||
      (item.to.length > 1 && location.pathname.startsWith(item.to)));

  const isChildActive = item.items?.some(
    (child: any) =>
      child.to &&
      (location.pathname === child.to ||
        location.pathname.startsWith(child.to))
  );

  const hasPermission = (required: string[] = []) =>
    required.length === 0 || required.some((p) => permissions.includes(p));

  const onClick = () => {
    if (item.items) {
      if (collapsed) return;
      setOpen(!open);
    } else {
      handleNavigate(item.to);
    }
  };

  if (!hasPermission(item.permission ?? [])) return null;

  const active = isActive || isChildActive;

  return (
    <div className="relative group/item">
      <motion.button
        onClick={onClick}
        whileHover={{ x: collapsed ? 0 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative flex items-center w-full gap-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
          collapsed ? "justify-center px-0 py-3" : "justify-between px-3 py-2.5"
        } ${
          active
            ? "bg-[#A0C82E]/15 text-[#A0C82E]"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        {/* Accent bar */}
        <AnimatePresence>
          {active && !collapsed && (
            <motion.span
              layoutId="activeBar"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#A0C82E]"
            />
          )}
        </AnimatePresence>

        {/* Icon + Label */}
        <div className={`flex items-center gap-3 ${collapsed ? "" : "pl-1"}`}>
          <span
            className={`text-lg flex-shrink-0 transition-colors duration-200 ${
              active ? "text-[#A0C82E]" : "text-slate-400 group-hover/item:text-white"
            }`}
          >
            {item.icon}
          </span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="leading-none whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </div>

        {/* Chevron */}
        {item.items && !collapsed && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-slate-500 flex-shrink-0"
          >
            <FiChevronDown className="text-xs" />
          </motion.span>
        )}
      </motion.button>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-700 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none z-[200] shadow-lg">
          {item.label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
        </div>
      )}

      {/* Sub-menu */}
      <AnimatePresence initial={false}>
        {item.items && open && !collapsed && (
          <motion.div
            key="submenu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="ml-4 mt-0.5 mb-1 border-l border-white/10 pl-3 flex flex-col gap-0.5">
              {item.items.map((child: any, i: number) => (
                <SidebarMenuItem
                  key={i}
                  item={child}
                  handleNavigate={handleNavigate}
                  location={location}
                  collapsed={false}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
