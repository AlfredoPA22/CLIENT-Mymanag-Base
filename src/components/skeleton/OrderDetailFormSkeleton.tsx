import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { FC } from "react";

export const OrderDetailFormSkeleton: FC = () => {
  return (
    <Card className="mb-2 p-4">
      <div className="flex flex-col md:flex-row justify-center items-center gap-2">
        <section className="grid xl:grid-cols-4 grid-cols-1 gap-2 w-full">
          <div className="md:col-span-2">
            <Skeleton width="100%" height="3.5rem" className="mb-1" />
          </div>
          <div className="md:col-span-1">
            <Skeleton width="100%" height="3.5rem" className="mb-1" />
          </div>
          <div className="md:col-span-1">
            <Skeleton width="100%" height="3.5rem" className="mb-1" />
          </div>
        </section>
        <section className="mt-2 md:mt-0">
          <Skeleton width="10rem" height="2.5rem" borderRadius="6px" />
        </section>
      </div>
    </Card>
  );
};
