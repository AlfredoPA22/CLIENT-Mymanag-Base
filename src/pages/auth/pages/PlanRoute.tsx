import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import usePlan from "../../../hooks/usePlan";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

type Props = {
  children: ReactNode;
};

export const PlanRoute = ({ children }: Props) => {
  const { isPro, loading } = usePlan();

  if (loading) return <LoadingSpinner />;
  if (!isPro) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};
