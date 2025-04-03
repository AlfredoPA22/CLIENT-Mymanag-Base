import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useEffect } from "react";
import {
  MdOutlineInventory,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/LOGO.png";
import useAuth from "../../pages/auth/hooks/useAuth";
import { setCurrentModule } from "../../redux/slices/navbarSlice";
import { RootState } from "../../redux/store";


const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { logout } = useAuth();

  const currentModule = useSelector(
    (state: RootState) => state.navbarSlice.currentModule
  );

  const items: MenuItem[] = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => {
        navigate("/");
        dispatch(setCurrentModule(0));
      },
    },
    {
      label: "Inventario",
      icon: <MdProductionQuantityLimits className="mr-2" />,
      command: () => {
        navigate("/product");
        dispatch(setCurrentModule(1));
      },
    },
    {
      label: "Compras",
      icon: <MdOutlineInventory className="mr-2" />,
      command: () => {
        navigate("/order/purchaseOrder");
        dispatch(setCurrentModule(2));
      },
    },
    {
      label: "Clientes",
      icon: "pi pi-inbox",
      command: () => {
        navigate("/client");
        dispatch(setCurrentModule(3));
      },
    },
    {
      label: "Ventas",
      icon: <MdOutlineInventory className="mr-2" />,
      command: () => {
        navigate("/order/saleOrder");
        dispatch(setCurrentModule(4));
      },
    },
    {
      label: "Admin",
      icon: "pi pi-cog",
      command: () => {
        navigate("/admin");
        dispatch(setCurrentModule(5));
      },
    },
    {
      label: "Cerrar sesion",
      icon: "pi pi-sign-out",
      command: () => {
        logout();
      },
    },
  ];

  const end = (
    <Link to={'/'}>
    <img
      className="w-[60px] h-[50px]"
      alt="logo"
      src={logo}
    ></img>
    </Link>
  );
  // const end = (
  //   <Avatar
  //     className="w-[50px] h-[50px]"
  //     image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
  //     shape="circle"
  //   />
  // );

  useEffect(() => {
    if (currentModule) {
      navigate(currentModule);
    }
  }, [currentModule, navigate]);

  return (
    <div className="m-2">
      <Menubar className="font-bold" model={items} end={end} />
    </div>
    // <nav
    //   data-testid="navbar-component"
    //   className="fixed z-10 w-full sm:relative"
    // >
    //   <section className="mx-auto px-4 py-2 max-sm:pb-0 sm:px-6 lg:px-8">
    //     <div className="flex items-center max-sm:justify-between">
    //       <div className="hidden justify-self-start sm:block sm:grow">
    //         <div className="flex items-baseline space-x-2">
    //           <TabMenu model={items} activeIndex={currentModule} />
    //         </div>
    //       </div>
    //     </div>
    //     <div className="mb-0 flex items-center justify-center pb-0 sm:hidden">
    //       <TabMenu model={items} activeIndex={currentModule} />
    //     </div>
    //   </section>
    // </nav>
  );
};

export default Navbar;
