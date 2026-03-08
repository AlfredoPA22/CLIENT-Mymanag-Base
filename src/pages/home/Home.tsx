import { FC } from "react";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import useAuth from "../auth/hooks/useAuth";
import HeaderHome from "./HeaderHome";
import SalesSection from "./SalesSection";
import SearchSection from "./SearchSection";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
};

const Home: FC = () => {
  const { userName } = useAuth();

  const dateLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting()},{" "}
            <span className="text-[#A0C82E]">
              {userName?.split(" ")[0] ?? ""}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{dateLabel}</p>
        </div>
      </div>

      <PermissionGuard permissions={["GENERAL_DATA"]}>
        <HeaderHome />
      </PermissionGuard>
      <PermissionGuard permissions={["SEARCH_PRODUCT"]}>
        <SearchSection />
      </PermissionGuard>
      <SalesSection />
    </div>
  );
};

export default Home;
