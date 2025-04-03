import { Route, Routes } from "react-router-dom";
import BrandList from "./pages/BrandList";
import CategoryList from "./pages/CategoryList";
import ProductDetail from "./pages/ProductDetail";
import ProductPage from "./pages/ProductPage";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/Detail/:id" element={<ProductDetail />} />
      <Route path="/Category" element={<CategoryList />} />
      <Route path="/Brand" element={<BrandList />} />
    </Routes>
  );
};

export default ProductRoutes;
