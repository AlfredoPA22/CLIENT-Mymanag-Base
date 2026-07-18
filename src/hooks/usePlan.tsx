import { useQuery } from "@apollo/client";
import { DETAIL_COMPANY } from "../graphql/queries/Company";
import { ICompany } from "../utils/interfaces/Company";
import { companyPlan } from "../utils/enums/companyPlan.enum";

const usePlan = () => {
  const { data, loading } = useQuery(DETAIL_COMPANY);
  const company: ICompany | null = data?.detailCompany ?? null;
  const isPro = company?.plan === companyPlan.PRO;

  return { company, isPro, loading };
};

export default usePlan;
