import { useQuery } from "@apollo/client";
import { DETAIL_COMPANY } from "../graphql/queries/Company";
import { ICompany } from "../utils/interfaces/Company";

const usePlan = () => {
  const { data, loading } = useQuery(DETAIL_COMPANY);
  const company: ICompany | null = data?.detailCompany ?? null;
  const isPro = company?.plan === "profesional";

  return { company, isPro, loading };
};

export default usePlan;
