import { Route, Routes } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";
import ProductPage from "./pages/ProductPage";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/Detail/:id" element={<ProductDetail />} />
    </Routes>
  );
};

export default ProductRoutes;
