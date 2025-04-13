import { FC } from "react";
import HeaderHome from "./HeaderHome";
import SearchSection from "./SearchSection";
import SalesSection from "./SalesSection";

const Home: FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <HeaderHome />
      <SearchSection />
      <SalesSection />
    </div>
  );
};

export default Home;
