import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { useEffect } from "react";
import {
  MdCategory,
  MdOutlineInventory,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentModule } from "../../redux/slices/navbarSlice";
import { RootState } from "../../redux/store";
import useAuth from "../../pages/auth/hooks/useAuth";

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
      label: "Categorias",
      icon: <MdCategory className="mr-2" />,
      command: () => {
        navigate("/product/category");
        dispatch(setCurrentModule(1));
      },
    },
    {
      label: "Marcas",
      icon: <MdCategory className="mr-2" />,
      command: () => {
        navigate("/product/brand");
        dispatch(setCurrentModule(2));
      },
    },
    {
      label: "Productos",
      icon: <MdProductionQuantityLimits className="mr-2" />,
      command: () => {
        navigate("/product");
        dispatch(setCurrentModule(3));
      },
    },
    {
      label: "Clientes",
      icon: "pi pi-inbox",
      command: () => {
        navigate("/client");
        dispatch(setCurrentModule(4));
      },
    },
    {
      label: "Proveedores",
      icon: "pi pi-inbox",
      command: () => {
        navigate("/provider");
        dispatch(setCurrentModule(5));
      },
    },
    {
      label: "compras",
      icon: <MdOutlineInventory className="mr-2" />,
      command: () => {
        navigate("/order/purchaseOrder");
        dispatch(setCurrentModule(6));
      },
    },
    {
      label: "Ventas",
      icon: <MdOutlineInventory className="mr-2" />,
      command: () => {
        navigate("/order/saleOrder");
        dispatch(setCurrentModule(7));
      },
    },
    {
      label: "Cerrar sesion",
      icon: 'pi pi-sign-out',
      command: () => {
        logout();
      },
    },
  ];
  useEffect(() => {
    if (currentModule) {
      navigate(currentModule);
    }
  }, [currentModule, navigate]);

  return (
    <nav
      data-testid="navbar-component"
      className="fixed z-10 w-full sm:relative"
    >
      <section className="mx-auto px-4 py-2 max-sm:pb-0 sm:px-6 lg:px-8">
        <div className="flex items-center max-sm:justify-between">
          <div className="hidden justify-self-start sm:block sm:grow">
            <div className="flex items-baseline space-x-2">
              <TabMenu model={items} activeIndex={currentModule} />
            </div>
          </div>
        </div>
        <div className="mb-0 flex items-center justify-center pb-0 sm:hidden">
          <TabMenu model={items} activeIndex={currentModule} />
        </div>
      </section>
    </nav>
  );
};

export default Navbar;
