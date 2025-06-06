import { FC } from "react";

import {
  ProgressSpinner,
  ProgressSpinnerProps,
} from "primereact/progressspinner";

interface LoadingSpinnerProps extends ProgressSpinnerProps {
  className?: string;
  sizeFull?: number;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  className = "",
  strokeWidth = "8",
  animationDuration = ".5s",
  sizeFull = 45,
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-center w-full h-full ${className}`}
    >
      <ProgressSpinner
        style={{ width: `${sizeFull}px`, height: `${sizeFull}px` }}
        strokeWidth={strokeWidth}
        animationDuration={animationDuration}
        {...props}
      />
    </div>
  );
};

export default LoadingSpinner;
