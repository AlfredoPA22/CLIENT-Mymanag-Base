// Espejo del enum companyPlan del backend (Api/API-Mymanag-Base/src/utils/enums/companyPlan.enum.ts).
// Los valores guardados en la base de datos son estos strings en español,
// no "FREE"/"BASIC"/"PRO".
export enum companyPlan {
  FREE = "prueba",
  BASIC = "basico",
  PRO = "profesional",
}

export const PLAN_LABELS: Record<string, string> = {
  [companyPlan.FREE]: "Gratis",
  [companyPlan.BASIC]: "Básico",
  [companyPlan.PRO]: "Pro",
};
