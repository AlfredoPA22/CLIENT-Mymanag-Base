import { Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import CategoryList from "./pages/CategoryList";
import BrandList from "./pages/BrandList";
import ProductDetail from "./pages/ProductDetail";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/Detail/:id" element={<ProductDetail />} />
      <Route path="/Category" element={<CategoryList />} />
      <Route path="/Brand" element={<BrandList />} />
    </Routes>
  );
};

export default ProductRoutes;
