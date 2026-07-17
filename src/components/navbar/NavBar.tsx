import { useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import useAuth from "../../pages/auth/hooks/useAuth";
import GlobalSearchModal from "../globalSearch/GlobalSearchModal";
import NotificationBell from "../notifications/NotificationBell";

type Props = {
  onToggleSidebar: () => void;
};

const Navbar = ({ onToggleSidebar }: Props) => {
  const { companyLogo } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 shadow-md bg-[#1e293b]">
      {/* Botón de menú */}
      <button
        onClick={onToggleSidebar}
        className="text-2xl text-white hover:text-[#7aa6d3]"
      >
        <HiMenuAlt2 />
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center">
        <div className="bg-white rounded-xl shadow-md px-3 py-1.5 flex items-center justify-center">
          <img
            src={
              companyLogo ||
              "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750478279/logo_OFICIAL_p6zujx.png"
            }
            alt="Logo"
            className="h-9 w-auto object-contain"
          />
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Buscar"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <FiSearch size={16} />
        </button>
        <NotificationBell buttonClassName="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10" />
      </div>

      <GlobalSearchModal visible={searchOpen} onHide={() => setSearchOpen(false)} />
    </div>
  );
};

export default Navbar;
