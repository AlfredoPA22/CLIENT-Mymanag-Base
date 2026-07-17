import { Dialog } from "primereact/dialog";
import SearchProductForm from "../../pages/product/pages/product/SearchProductForm";

interface GlobalSearchModalProps {
  visible: boolean;
  onHide: () => void;
}

// Búsqueda global (Ctrl/Cmd+K): por ahora reutiliza el mismo buscador de
// productos ya existente (código, nombre, marca, categoría o serial), sin
// duplicar esa lógica. Ampliar a clientes/proveedores/pedidos queda como
// posible mejora futura.
const GlobalSearchModal = ({ visible, onHide }: GlobalSearchModalProps) => {
  return (
    <Dialog
      className="md:w-[50vw] w-[95vw]"
      visible={visible}
      header="Buscar (Ctrl+K)"
      onHide={onHide}
    >
      <SearchProductForm onSelect={onHide} />
    </Dialog>
  );
};

export default GlobalSearchModal;
