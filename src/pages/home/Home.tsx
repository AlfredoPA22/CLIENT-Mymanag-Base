import { FC } from "react";
import HeaderHome from "./HeaderHome";
import SearchSection from "./SearchSection";
import SalesSection from "./SalesSection";
import { PermissionGuard } from "../auth/pages/PermissionGuard";

const Home: FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <PermissionGuard permissions={["GENERAL_DA    TA"]}>
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
