import { FC } from "react";
import HeaderHome from "./HeaderHome";
import SearchSection from "./SearchSection";

const Home: FC = () => {
  return (
    <div className="flex flex-col gap-5 w-full px-4 py-6">
      <HeaderHome />
      <SearchSection />
    </div>
  );
};

export default Home;
