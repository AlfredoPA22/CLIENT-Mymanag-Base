import { Card } from "primereact/card";

const ReportByClientSkeleton = () => {
  return (
    <Card title="Mejores clientes" className="w-full">
      <div className="space-y-3 mt-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-24 h-4 bg-gray-300 rounded" /> {/* etiqueta */}
            <div className="flex-1 h-4 bg-gray-200 rounded" /> {/* barra */}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportByClientSkeleton;
