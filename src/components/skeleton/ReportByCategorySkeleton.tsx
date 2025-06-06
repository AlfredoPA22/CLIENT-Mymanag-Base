import { Card } from "primereact/card";

const ReportByCategorySkeleton = () => {
  return (
    <Card title="Mejores categorías" className="w-full">
      <div className="flex justify-center items-center h-64 animate-pulse">
        <div className="w-48 h-48 rounded-full bg-gray-200" />
      </div>
    </Card>
  );
};

export default ReportByCategorySkeleton;
