import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useMemo } from "react";
import Table from "../../../../components/datatable/Table";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { IKardexEntry } from "../../../../utils/interfaces/Kardex";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../../order/utils/getDate";
import useKardexByProduct from "../../hooks/useKardexByProduct";
import useAuth from "../../../auth/hooks/useAuth";
import { useAbility } from "../../../../casl/AbilityContext";

interface ProductKardexListProps {
  productId: string;
}

type TagSeverity = "success" | "info" | "warning" | "danger" | "secondary" | "contrast";

const TYPE_CONFIG: Record<string, { severity: TagSeverity; icon: string; label: string }> = {
  Compra:        { severity: "success", icon: "pi pi-arrow-down",  label: "Compra" },
  Venta:         { severity: "danger",  icon: "pi pi-arrow-up",    label: "Venta" },
  "Devolución":  { severity: "warning", icon: "pi pi-refresh",     label: "Devolución" },
  Transferencia: { severity: "info",    icon: "pi pi-arrows-h",    label: "Transferencia" },
};

const ENTITY_LABEL: Record<string, string> = {
  Compra:        "Proveedor",
  Venta:         "Cliente",
  "Devolución":  "Motivo",
  Transferencia: "Ruta",
};

const ProductKardexList: FC<ProductKardexListProps> = ({ productId }) => {
  const { listKardex, loadingKardex } = useKardexByProduct(productId);
  const { currency } = useAuth();
  const ability = useAbility();
  const canViewCost = ability.can("read", "ProductCost");

  const columns = useMemo<DataTableColumn<IKardexEntry>[]>(() => {
    const typeBody = (r: IKardexEntry) => {
      const cfg = TYPE_CONFIG[r.type] ?? { severity: "secondary" as TagSeverity, icon: "pi pi-circle", label: r.type };
      return <Tag severity={cfg.severity} icon={cfg.icon} value={cfg.label} />;
    };

    const quantityBody = (r: IKardexEntry) => {
      const isT = r.type === "Transferencia";
      const color = isT ? "text-gray-600" : r.quantity >= 0 ? "text-green-700" : "text-red-600";
      const label = isT ? `${r.quantity}` : r.quantity >= 0 ? `+${r.quantity}` : `${r.quantity}`;
      return <span className={`font-bold ${color}`}>{label}</span>;
    };

    const moneyBody = (field: "unit_price" | "subtotal") => (r: IKardexEntry) => {
      const val = r[field];
      if (!val) return <span className="text-gray-400">—</span>;
      return <span className="font-medium">{currency} {val.toFixed(2)}</span>;
    };

    const base: DataTableColumn<IKardexEntry>[] = [
      {
        field: "date", header: "Fecha", sortable: true,
        body: (r) => <Tag severity="secondary" className="text-xs">{getDate(r.date)}</Tag>,
        style: { width: "12%" },
      },
      { field: "type", header: "Tipo", sortable: true, body: typeBody, style: { width: "11%" } },
      { field: "reference_code", header: "Referencia", sortable: true, style: { width: "11%" } },
      { field: "entity_name", header: "Entidad", sortable: true, style: { width: canViewCost ? "16%" : "24%" } },
      {
        field: "quantity", header: "Cant.", sortable: true,
        body: quantityBody,
        style: { width: "8%", textAlign: "center" },
      },
    ];

    if (canViewCost) {
      base.push(
        { field: "unit_price", header: "P. Unit.", sortable: true, body: moneyBody("unit_price"), style: { width: "11%", textAlign: "right" } },
        { field: "subtotal",   header: "Subtotal", sortable: true, body: moneyBody("subtotal"),   style: { width: "11%", textAlign: "right" } },
      );
    }

    base.push(
      { field: "balance",     header: "Saldo (cant.)", sortable: true, body: (r) => <span className="font-bold text-gray-800">{r.balance}</span>, style: { width: "9%", textAlign: "center" } },
      { field: "created_by",  header: "Usuario",  sortable: true,
        body: (r) => <span className="flex items-center gap-1 text-xs text-gray-600"><i className="pi pi-user text-gray-400" />{r.created_by}</span>,
        style: { width: "11%" } },
    );

    return base;
  }, [canViewCost, currency]);

  if (loadingKardex) return <TableSkeleton />;

  return (
    <Card title="Kardex de inventario">
      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {listKardex.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin movimientos registrados.</p>
        )}
        {listKardex.map((item) => {
          const cfg = TYPE_CONFIG[item.type] ?? { severity: "secondary" as TagSeverity, icon: "pi pi-circle", label: item.type };
          const isT = item.type === "Transferencia";
          const qColor = isT ? "text-gray-600" : item.quantity >= 0 ? "text-green-700" : "text-red-600";
          const qLabel = isT ? `${item.quantity}` : item.quantity >= 0 ? `+${item.quantity}` : `${item.quantity}`;
          const entityLabel = ENTITY_LABEL[item.type] ?? "Entidad";

          return (
            <div key={item._id} className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
              {/* Tipo + fecha */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <Tag severity={cfg.severity} icon={cfg.icon} value={cfg.label} className="text-xs" />
                {item.date && <Tag severity="secondary" className="text-xs">{getDate(item.date)}</Tag>}
              </div>

              {/* Referencia + entidad */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-400">Referencia</p>
                  <p className="text-sm font-semibold text-gray-800">{item.reference_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{entityLabel}</p>
                  <p className="text-sm font-medium text-gray-700 break-words text-right max-w-[160px]">{item.entity_name}</p>
                </div>
              </div>

              {/* Cant. + precios (si tiene permiso) */}
              <div className={`grid gap-2 text-center bg-gray-50 rounded-lg py-2 mb-2 ${canViewCost && !isT ? "grid-cols-3" : "grid-cols-1"}`}>
                <div>
                  <p className="text-xs text-gray-400">Cant.</p>
                  <p className={`text-sm font-bold ${qColor}`}>{qLabel}</p>
                </div>
                {canViewCost && !isT && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400">P. Unit.</p>
                      <p className="text-sm font-medium">{item.unit_price ? `${currency} ${item.unit_price.toFixed(2)}` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Subtotal</p>
                      <p className="text-sm font-medium">{item.subtotal ? `${currency} ${item.subtotal.toFixed(2)}` : "—"}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Saldo + usuario */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <i className="pi pi-user" />
                  {item.created_by}
                </span>
                <span className="text-sm">
                  Saldo: <span className="font-bold text-gray-800">{item.balance}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={listKardex}
          emptyMessage="Sin movimientos registrados."
          size="small"
        />
      </div>
    </Card>
  );
};

export default ProductKardexList;
