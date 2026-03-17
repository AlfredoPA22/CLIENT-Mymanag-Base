import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";

export type AppAbility = MongoAbility;

/**
 * Construye la Ability de CASL a partir del array de permisos del JWT.
 * Mismo mapeo que el backend — los permisos en DB no cambian.
 */
export function buildAbility(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  for (const perm of permissions) {
    switch (perm) {
      // ── Marcas ──────────────────────────────────────────────────────────────
      case "ALL_BRANDS":
        can("manage", "Brand");
        break;
      case "LIST_BRAND":
        can("list", "Brand");
        break;
      case "CREATE_BRAND":
        can("create", "Brand");
        break;
      case "DELETE_BRAND":
        can("delete", "Brand");
        break;
      case "UPDATE_BRAND":
        can("update", "Brand");
        break;

      // ── Categorías ──────────────────────────────────────────────────────────
      case "ALL_CATEGORIES":
        can("manage", "Category");
        break;
      case "LIST_CATEGORY":
        can("list", "Category");
        break;
      case "CREATE_CATEGORY":
        can("create", "Category");
        break;
      case "DELETE_CATEGORY":
        can("delete", "Category");
        break;
      case "UPDATE_CATEGORY":
        can("update", "Category");
        break;

      // ── Clientes ────────────────────────────────────────────────────────────
      case "ALL_CLIENTS":
        can("manage", "Client");
        break;
      case "LIST_CLIENT":
        can("list", "Client");
        break;
      case "CREATE_CLIENT":
        can("create", "Client");
        break;
      case "LIST_SALE_ORDER_BY_CLIENT":
        can("listSaleOrders", "Client");
        break;
      case "DELETE_CLIENT":
        can("delete", "Client");
        break;
      case "UPDATE_CLIENT":
        can("update", "Client");
        break;

      // ── Inicio / Dashboard ──────────────────────────────────────────────────
      case "ALL_HOME":
        can("manage", "Home");
        break;
      case "SEARCH_PRODUCT":
        can("search", "Product");
        break;
      case "GENERAL_DATA":
        can("read", "GeneralData");
        break;
      case "REPORT_SALE_ORDER_BY_CLIENT":
        can("read", "ReportByClient");
        break;
      case "REPORT_SALE_ORDER_BY_CATEGORY":
        can("read", "ReportByCategory");
        break;
      case "REPORT_SALE_ORDER_BY_MONTH":
        can("read", "ReportByMonth");
        break;

      // ── Reportes ────────────────────────────────────────────────────────────
      case "ALL_REPORT":
        can("manage", "Report");
        break;
      case "PRODUCT_REPORT":
        can("read", "ProductReport");
        break;
      case "PURCHASE_ORDER_REPORT":
        can("read", "PurchaseReport");
        break;
      case "SALE_ORDER_REPORT":
        can("read", "SaleReport");
        break;

      // ── Almacenes ───────────────────────────────────────────────────────────
      case "ALL_WAREHOUSES":
        can("manage", "Warehouse");
        break;
      case "LIST_WAREHOUSE":
        can("list", "Warehouse");
        break;
      case "CREATE_WAREHOUSE":
        can("create", "Warehouse");
        break;
      case "DELETE_WAREHOUSE":
        can("delete", "Warehouse");
        break;
      case "UPDATE_WAREHOUSE":
        can("update", "Warehouse");
        break;

      // ── Productos ───────────────────────────────────────────────────────────
      case "ALL_PRODUCTS":
        can("manage", "Product");
        break;
      case "LIST_PRODUCT":
        can("list", "Product");
        break;
      case "CREATE_PRODUCT":
        can("create", "Product");
        break;
      case "FIND_PRODUCT":
        can("read", "Product");
        break;
      case "VIEW_PRODUCT_COST":
        can("read", "ProductCost");
        break;
      case "LIST_PRODUCT_SERIAL_BY_PRODUCT":
        can("listSerials", "Product");
        break;
      case "LIST_PRODUCT_INVENTORY_BY_PRODUCT":
        can("listInventory", "Product");
        break;
      case "DELETE_PRODUCT":
        can("delete", "Product");
        break;
      case "UPDATE_PRODUCT":
        can("update", "Product");
        break;

      // ── Proveedores ─────────────────────────────────────────────────────────
      case "ALL_PROVIDERS":
        can("manage", "Provider");
        break;
      case "LIST_PROVIDER":
        can("list", "Provider");
        break;
      case "CREATE_PROVIDER":
        can("create", "Provider");
        break;
      case "DELETE_PROVIDER":
        can("delete", "Provider");
        break;
      case "UPDATE_PROVIDER":
        can("update", "Provider");
        break;

      // ── Compras ─────────────────────────────────────────────────────────────
      case "ALL_PURCHASES":
        can("manage", "Purchase");
        break;
      case "LIST_PURCHASE":
        can("list", "Purchase");
        break;
      case "CREATE_PURCHASE":
        can("create", "Purchase");
        break;
      case "DETAIL_PURCHASE":
        can("read", "Purchase");
        break;
      case "EDIT_PURCHASE":
        can("update", "Purchase");
        break;
      case "DELETE_PURCHASE":
        can("delete", "Purchase");
        break;

      // ── Ventas ──────────────────────────────────────────────────────────────
      case "ALL_SALES":
        can("manage", "Sale");
        break;
      case "LIST_SALE":
        can("list", "Sale");
        break;
      case "CREATE_SALE":
        can("create", "Sale");
        break;
      case "DETAIL_SALE":
        can("read", "Sale");
        break;
      case "EDIT_SALE":
        can("update", "Sale");
        break;
      case "DELETE_SALE":
        can("delete", "Sale");
        break;

      // ── Pagos ───────────────────────────────────────────────────────────────
      case "ALL_PAYMENTS":
        can("manage", "Payment");
        break;
      case "LIST_PAYMENT":
        can("list", "Payment");
        break;
      case "CREATE_PAYMENT":
        can("create", "Payment");
        break;
      case "DELETE_PAYMENT":
        can("delete", "Payment");
        break;

      // ── Usuarios y Roles ────────────────────────────────────────────────────
      case "USER_AND_ROLE":
        can("manage", "User");
        can("manage", "Role");
        break;

      // ── Empresa ─────────────────────────────────────────────────────────────
      case "ALL_COMPANY":
        can("manage", "Company");
        break;
      case "UPDATE_COMPANY":
        can("update", "Company");
        break;

      // ── Transferencias ──────────────────────────────────────────────────────
      case "ALL_TRANSFERS":
        can("manage", "Transfer");
        break;
      case "LIST_TRANSFER":
        can("list", "Transfer");
        break;
      case "CREATE_TRANSFER":
        can("create", "Transfer");
        break;
      case "DETAIL_TRANSFER":
        can("read", "Transfer");
        break;
      case "EDIT_TRANSFER":
        can("update", "Transfer");
        break;
      case "DELETE_TRANSFER":
        can("delete", "Transfer");
        break;
    }
  }

  return build();
}

/**
 * Mapeo de permission strings a checks CASL [action, subject].
 * Permite que PermissionRoute y PermissionGuard sigan usando strings
 * sin cambiar PrivateRoutes.tsx — compatibilidad total con el sistema actual.
 */
const PERMISSION_MAP: Record<string, Array<[string, string]>> = {
  ALL_BRANDS: [["manage", "Brand"]],
  LIST_BRAND: [["list", "Brand"]],
  CREATE_BRAND: [["create", "Brand"]],
  DELETE_BRAND: [["delete", "Brand"]],
  UPDATE_BRAND: [["update", "Brand"]],
  ALL_CATEGORIES: [["manage", "Category"]],
  LIST_CATEGORY: [["list", "Category"]],
  CREATE_CATEGORY: [["create", "Category"]],
  DELETE_CATEGORY: [["delete", "Category"]],
  UPDATE_CATEGORY: [["update", "Category"]],
  ALL_CLIENTS: [["manage", "Client"]],
  LIST_CLIENT: [["list", "Client"]],
  CREATE_CLIENT: [["create", "Client"]],
  LIST_SALE_ORDER_BY_CLIENT: [["listSaleOrders", "Client"]],
  DELETE_CLIENT: [["delete", "Client"]],
  UPDATE_CLIENT: [["update", "Client"]],
  ALL_HOME: [["manage", "Home"]],
  SEARCH_PRODUCT: [["search", "Product"]],
  GENERAL_DATA: [["read", "GeneralData"]],
  REPORT_SALE_ORDER_BY_CLIENT: [["read", "ReportByClient"]],
  REPORT_SALE_ORDER_BY_CATEGORY: [["read", "ReportByCategory"]],
  REPORT_SALE_ORDER_BY_MONTH: [["read", "ReportByMonth"]],
  ALL_REPORT: [["manage", "Report"]],
  PRODUCT_REPORT: [["read", "ProductReport"]],
  PURCHASE_ORDER_REPORT: [["read", "PurchaseReport"]],
  SALE_ORDER_REPORT: [["read", "SaleReport"]],
  ALL_WAREHOUSES: [["manage", "Warehouse"]],
  LIST_WAREHOUSE: [["list", "Warehouse"]],
  CREATE_WAREHOUSE: [["create", "Warehouse"]],
  DELETE_WAREHOUSE: [["delete", "Warehouse"]],
  UPDATE_WAREHOUSE: [["update", "Warehouse"]],
  ALL_PRODUCTS: [["manage", "Product"]],
  LIST_PRODUCT: [["list", "Product"]],
  CREATE_PRODUCT: [["create", "Product"]],
  FIND_PRODUCT: [["read", "Product"]],
  VIEW_PRODUCT_COST: [["read", "ProductCost"]],
  LIST_PRODUCT_SERIAL_BY_PRODUCT: [["listSerials", "Product"]],
  LIST_PRODUCT_INVENTORY_BY_PRODUCT: [["listInventory", "Product"]],
  DELETE_PRODUCT: [["delete", "Product"]],
  UPDATE_PRODUCT: [["update", "Product"]],
  ALL_PROVIDERS: [["manage", "Provider"]],
  LIST_PROVIDER: [["list", "Provider"]],
  CREATE_PROVIDER: [["create", "Provider"]],
  DELETE_PROVIDER: [["delete", "Provider"]],
  UPDATE_PROVIDER: [["update", "Provider"]],
  ALL_PURCHASES: [["manage", "Purchase"]],
  LIST_PURCHASE: [["list", "Purchase"]],
  CREATE_PURCHASE: [["create", "Purchase"]],
  DETAIL_PURCHASE: [["read", "Purchase"]],
  EDIT_PURCHASE: [["update", "Purchase"]],
  DELETE_PURCHASE: [["delete", "Purchase"]],
  ALL_SALES: [["manage", "Sale"]],
  LIST_SALE: [["list", "Sale"]],
  CREATE_SALE: [["create", "Sale"]],
  DETAIL_SALE: [["read", "Sale"]],
  EDIT_SALE: [["update", "Sale"]],
  DELETE_SALE: [["delete", "Sale"]],
  ALL_PAYMENTS: [["manage", "Payment"]],
  LIST_PAYMENT: [["list", "Payment"]],
  CREATE_PAYMENT: [["create", "Payment"]],
  DELETE_PAYMENT: [["delete", "Payment"]],
  USER_AND_ROLE: [["manage", "User"], ["manage", "Role"]],
  ALL_COMPANY: [["manage", "Company"]],
  UPDATE_COMPANY: [["update", "Company"]],
  ALL_TRANSFERS: [["manage", "Transfer"]],
  LIST_TRANSFER: [["list", "Transfer"]],
  CREATE_TRANSFER: [["create", "Transfer"]],
  DETAIL_TRANSFER: [["read", "Transfer"]],
  EDIT_TRANSFER: [["update", "Transfer"]],
  DELETE_TRANSFER: [["delete", "Transfer"]],
};

/**
 * Verifica si la ability satisface un permission string del sistema.
 * Uso: canDo(ability, 'LIST_PURCHASE')
 */
export function canDo(ability: AppAbility, permission: string): boolean {
  const checks = PERMISSION_MAP[permission];
  if (!checks) return false;
  return checks.some(([action, subject]) => ability.can(action, subject));
}

/**
 * Verifica si la ability satisface AL MENOS UNO de los permission strings.
 * Uso: canDoAny(ability, ['LIST_PURCHASE', 'CREATE_PURCHASE'])
 */
export function canDoAny(ability: AppAbility, permissions: string[]): boolean {
  return permissions.some((p) => canDo(ability, p));
}
