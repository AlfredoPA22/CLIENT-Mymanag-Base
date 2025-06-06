import { Card } from "primereact/card";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  title?: string;
}

const TableSkeleton = ({
  columns = 5,
  rows = 6,
  title = "Cargando datos...",
}: TableSkeletonProps) => {
  return (
    <Card title={title} className="w-full">
      <div className="overflow-x-auto">
        <div className="w-full animate-pulse">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] border-b border-gray-300 pb-2 mb-2">
            {[...Array(columns)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-3/4 mx-auto" />
            ))}
          </div>
          {[...Array(rows)].map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 py-2 border-b border-gray-100"
            >
              {[...Array(columns)].map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="h-4 bg-gray-200 rounded w-5/6 mx-auto"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TableSkeleton;
