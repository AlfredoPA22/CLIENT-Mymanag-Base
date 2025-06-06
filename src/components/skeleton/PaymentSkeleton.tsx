import { Skeleton } from "primereact/skeleton";
import { FC } from "react";

export const PaymentSkeleton: FC = () => {
  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <Skeleton width="12rem" height="2rem" className="mb-2" />
        <Skeleton width="20rem" height="1rem" />
      </div>

      {/* Info de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <section
            key={i}
            className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm"
          >
            <Skeleton width="8rem" height="1rem" />
            <Skeleton width="6rem" height="2rem" />
          </section>
        ))}
      </div>

      {/* Código y estado */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center">
          <Skeleton width="8rem" height="1rem" className="mb-1" />
          <Skeleton width="6rem" height="1.5rem" />
        </div>
        <div className="flex flex-col items-center">
          <Skeleton width="6rem" height="1rem" className="mb-1" />
          <Skeleton width="7rem" height="2rem" borderRadius="16px" />
        </div>
      </div>

      {/* Tag de estado de pago */}
      <div className="mt-6 flex justify-center">
        <Skeleton width="16rem" height="2.5rem" borderRadius="16px" />
      </div>
    </div>
  );
};
