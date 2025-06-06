import { FC, ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="relative mb-5">
      {/* Acciones en pantallas grandes */}
      {actions && (
        <div className="hidden md:block absolute right-0 top-0">{actions}</div>
      )}

      {/* Título y subtítulo */}
      <div className="flex flex-col items-center text-center gap-2">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}

        {/* Acciones en móviles */}
        {actions && <div className="block md:hidden mt-2">{actions}</div>}
      </div>
    </div>
  );
};

export default SectionHeader;
