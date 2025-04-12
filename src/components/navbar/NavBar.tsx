import { HiMenuAlt2 } from "react-icons/hi";
import { Link } from "react-router-dom";
import logo from "../../assets/LOGO.png";

type Props = {
  onToggleSidebar: () => void;
};

const Navbar = ({ onToggleSidebar }: Props) => {
  return (
    <div className="flex items-center justify-between p-4 shadow-md bg-white">
      {/* Botón de menú */}
      <button
        onClick={onToggleSidebar}
        className="text-2xl text-gray-800 hover:text-blue-600"
      >
        <HiMenuAlt2 />
      </button>

      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-10 w-auto" />
      </Link>
    </div>
  );
};

export default Navbar;
