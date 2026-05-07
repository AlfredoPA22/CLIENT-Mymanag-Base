import { FC, useState } from "react";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import useAuth from "../auth/hooks/useAuth";
import DateRangePicker from "./DateRangePicker";
import GuidesSection from "./GuidesSection";
import HeaderHome from "./HeaderHome";
import SalesSection from "./SalesSection";
import SearchSection from "./SearchSection";
import TopRankingsSection from "./TopRankingsSection";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
};

const getDefaultRange = (): [Date, Date] => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [start, end];
};

const Home: FC = () => {
  const { userName } = useAuth();
  const [appliedRange, setAppliedRange] = useState<[Date, Date]>(getDefaultRange);

  const [startDate, endDate] = appliedRange;

  const dateLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div id="dashboard-main" className="flex flex-col gap-4 w-full">
      {/* Greeting + filtro global de fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting()},{" "}
            <span className="text-[#A0C82E]">
              {userName?.split(" ")[0] ?? ""}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{dateLabel}</p>
        </div>

        <DateRangePicker value={appliedRange} onChange={setAppliedRange} />
      </div>

      <PermissionGuard permissions={["GENERAL_DATA"]}>
        <HeaderHome startDate={startDate} endDate={endDate} />
      </PermissionGuard>

      <GuidesSection />

      <PermissionGuard permissions={["SEARCH_PRODUCT"]}>
        <SearchSection />
      </PermissionGuard>

      <TopRankingsSection startDate={startDate} endDate={endDate} />

      <SalesSection startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default Home;
