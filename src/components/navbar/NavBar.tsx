import { HiMenuAlt2 } from "react-icons/hi";
import { Link } from "react-router-dom";

type Props = {
  onToggleSidebar: () => void;
};

const Navbar = ({ onToggleSidebar }: Props) => {
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
      <Link to="/">
        <img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750478279/logo_OFICIAL_p6zujx.png"
          alt="Logo"
          className="h-10 w-auto"
        />
      </Link>
    </div>
  );
};

export default Navbar;
