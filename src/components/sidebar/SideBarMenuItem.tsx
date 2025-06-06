import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import useAuth from "../../pages/auth/hooks/useAuth";

export const SidebarMenuItem = ({ item, handleNavigate, location }: any) => {
  const [open, setOpen] = useState(false);
  const { permissions } = useAuth();
  const isActive = location.pathname === item.to;

  const hasPermission = (required: string[] = []) =>
    required.length === 0 || required.some((p) => permissions.includes(p));

  const onClick = () => {
    if (item.items) setOpen(!open);
    else handleNavigate(item.to);
  };

  if (!hasPermission(item.permission ?? [])) return null;

  return (
    <div>
      <button
        onClick={onClick}
        className={`flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-gray-200 text-gray-900"
            : "text-gray-700 hover:bg-gray-100 hover:text-black"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </div>
        {item.items && (
          <FaChevronDown
            className={`text-sm transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {item.items && (
        <div
          className={`ml-5 overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 py-1">
            {item.items.map((child: any, i: number) => (
              <SidebarMenuItem
                key={i}
                item={child}
                handleNavigate={handleNavigate}
                location={location}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
