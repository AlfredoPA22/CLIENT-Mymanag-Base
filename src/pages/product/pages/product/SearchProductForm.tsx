import { useApolloClient } from "@apollo/client";
import { Tag } from "primereact/tag";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BarcodeScannerButton from "../../../../components/barcodeScanner/BarcodeScannerButton";
import ProductImagePlaceholder from "../../../../components/ProductImagePlaceholder/ProductImagePlaceholder";
import { SEARCH_PRODUCT } from "../../../../graphql/queries/Product";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IProduct } from "../../../../utils/interfaces/Product";
import useAuth from "../../../auth/hooks/useAuth";
import { getStatus } from "../../../order/utils/getStatus";
import useProductList from "../../hooks/useProductList";
import { formatAmount } from "../../../../utils/currency";

interface Props {
  onSelect?: () => void;
}

const SearchProductForm = ({ onSelect }: Props) => {
  const { listProduct } = useProductList();
  const { currency } = useAuth();
  const navigate = useNavigate();
  const client = useApolloClient();

  const [query, setQuery] = useState("");
  const [serialMatch, setSerialMatch] = useState<IProduct | null>(null);
  const [searchingSerial, setSearchingSerial] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Client-side filter: name, code, brand, category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return listProduct.filter(
      (p: IProduct) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [query, listProduct]);

  // Backend serial search with 400ms debounce
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSerialMatch(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchingSerial(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await client.query({
          query: SEARCH_PRODUCT,
          variables: { serial: q },
          fetchPolicy: "network-only",
        });
        setSerialMatch(data?.searchProduct ?? null);
      } catch {
        setSerialMatch(null);
      } finally {
        setSearchingSerial(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, client]);

  // Merge: serial match first (if not already in filtered), then the rest
  const results = useMemo(() => {
    if (!serialMatch) return filtered;
    const alreadyIn = filtered.some((p) => p._id === serialMatch._id);
    return alreadyIn ? filtered : [serialMatch, ...filtered];
  }, [filtered, serialMatch]);

  const serialMatchId = serialMatch?._id;

  const totalCount = results.length;

  const handleSelect = (productId: string) => {
    navigate(`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${productId}`);
    onSelect?.();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código, nombre, marca, categoría o serial..."
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => { setQuery(""); setSerialMatch(null); }}
            >
              <i className="pi pi-times text-xs" />
            </button>
          )}
        </div>
        <BarcodeScannerButton onScan={(value) => setQuery(value)} />
      </div>

      {/* Hint */}
      {query.trim().length < 2 && (
        <p className="text-center text-gray-400 text-sm py-6">
          Escribe al menos 2 caracteres para buscar...
        </p>
      )}

      {/* Results */}
      {query.trim().length >= 2 && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">
              {totalCount === 0
                ? "Sin resultados"
                : `${totalCount} producto${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`}
            </p>
            {searchingSerial && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <i className="pi pi-spin pi-spinner text-[10px]" />
                buscando por serial...
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-0.5">
            {results.map((product: IProduct) => {
              const status = getStatus(product.status);
              const isSerialHit = product._id === serialMatchId && !filtered.some((p) => p._id === serialMatchId);

              return (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelect(product._id)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-slate-50 hover:border-gray-200 text-left transition-colors w-full"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      name={product.name}
                      className="w-12 h-12 rounded-lg shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{product.code}</span>
                      {status && (
                        <Tag
                          severity={status.severity as "danger" | "success"}
                          className="text-[10px] py-0 px-1.5 leading-tight"
                        >
                          {status.label}
                        </Tag>
                      )}
                      {isSerialHit && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-500 border border-indigo-100 rounded px-1.5 py-0 font-medium">
                          <i className="pi pi-barcode text-[9px]" />
                          Serial
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {[product.brand?.name, product.category?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-700">
                      {currency} {formatAmount(product.sale_price ?? 0)}
                    </p>
                    <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                  </div>

                  <i className="pi pi-chevron-right text-gray-300 text-xs shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchProductForm;
