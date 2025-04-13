import SearchProductForm from "../product/pages/SearchProductForm";
import ReportByClient from "./ReportByClient";

const SearchSection = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-2">
      <SearchProductForm />
      <ReportByClient />
    </div>
  );
};

export default SearchSection;
