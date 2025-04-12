import SearchProductForm from "../product/pages/SearchProductForm";
import Dashboards from "./Dashboards";

const SearchSection = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-2 p-2">
      <SearchProductForm />
      <Dashboards />
    </div>
  );
};

export default SearchSection;
