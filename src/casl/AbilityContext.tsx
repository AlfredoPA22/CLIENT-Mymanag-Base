import { createContext, useContext, type ReactNode } from "react";
import { createMongoAbility, type MongoAbility } from "@casl/ability";
import { useSelector } from "react-redux";
import { type RootState } from "../redux/store";
import { buildAbility } from "./ability";

export type AppAbility = MongoAbility;

// Ability vacía como default (usuario sin permisos)
const defaultAbility = createMongoAbility([]);

const AbilityContext = createContext<AppAbility>(defaultAbility);

/**
 * Provee la Ability de CASL construida a partir de los permisos del usuario
 * autenticado en Redux. Se reconstruye automáticamente si cambian los permisos.
 */
export function AbilityProvider({ children }: { children: ReactNode }) {
  const permissions = useSelector(
    (state: RootState) => state.authSlice.permissions
  );

  const ability = buildAbility(permissions);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

/**
 * Hook para usar la Ability de CASL en cualquier componente.
 * Ejemplo: const ability = useAbility();
 *          ability.can("delete", "Brand")
 */
export function useAbility(): AppAbility {
  return useContext(AbilityContext);
}
