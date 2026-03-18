import { Card } from "primereact/card";
import SearchProductForm from "../product/pages/product/SearchProductForm";

const SearchSection = () => {
  return (
    <Card title="Buscar productos" className="flex flex-col rounded-lg gap-5">
      <SearchProductForm />
    </Card>
  );
};

export default SearchSection;
