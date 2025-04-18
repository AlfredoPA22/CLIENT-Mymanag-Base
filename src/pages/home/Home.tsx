import { FC } from "react";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import HeaderHome from "./HeaderHome";
import SalesSection from "./SalesSection";
import SearchSection from "./SearchSection";

const Home: FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
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
