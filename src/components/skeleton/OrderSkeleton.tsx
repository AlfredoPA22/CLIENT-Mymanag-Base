import { Skeleton } from "primereact/skeleton";

export const OrderSkeleton = () => (
  <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
    <div className="flex flex-col items-center text-center gap-2 mb-5">
      <Skeleton width="12rem" height="2rem" className="mb-2" />
      <Skeleton width="20rem" height="1rem" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* Info proveedor y fecha */}
      <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
        <div className="flex flex-col gap-1">
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="6rem" height="1.5rem" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="10rem" height="1.5rem" />
        </div>
      </section>

      {/* Total */}
      <section className="flex flex-col items-center justify-center">
        <Skeleton width="10rem" height="1rem" className="mb-2" />
        <Skeleton width="6rem" height="2rem" />
      </section>

      {/* Código y estado */}
      <section className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md w-full">
          <Skeleton width="6rem" height="1rem" />
          <Skeleton width="8rem" height="1.75rem" />
          <Skeleton width="5rem" height="1.5rem" borderRadius="16px" />
        </div>
        <Skeleton width="8rem" height="2.5rem" borderRadius="6px" />
      </section>
    </div>
  </div>
);
