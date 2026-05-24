import { FC } from "react";

interface Props {
  name?: string;
  className?: string;
}

// Deterministic color from product name
const PALETTES = [
  { bg: "#EFF6FF", icon: "#93C5FD", text: "#60A5FA" },
  { bg: "#F0FDF4", icon: "#86EFAC", text: "#4ADE80" },
  { bg: "#FFF7ED", icon: "#FDC09A", text: "#FB923C" },
  { bg: "#FDF4FF", icon: "#E9D5FF", text: "#C084FC" },
  { bg: "#FFFBEB", icon: "#FDE68A", text: "#FBBF24" },
  { bg: "#F0FDFA", icon: "#99F6E4", text: "#2DD4BF" },
  { bg: "#FFF1F2", icon: "#FECDD3", text: "#FB7185" },
  { bg: "#F8FAFC", icon: "#CBD5E1", text: "#94A3B8" },
];

const getPalette = (name = "") => {
  const idx =
    [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTES.length;
  return PALETTES[idx];
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const ProductImagePlaceholder: FC<Props> = ({ name, className = "" }) => {
  const { bg, icon, text } = getPalette(name);
  const initials = getInitials(name);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 select-none ${className}`}
      style={{ backgroundColor: bg }}
    >
      {/* Package box icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[38%] h-[38%] opacity-90"
      >
        {/* Box body */}
        <path
          d="M20.5 7.278L12 3 3.5 7.278V16.72L12 21l8.5-4.278V7.278Z"
          stroke={icon}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={bg}
        />
        {/* Middle crease */}
        <path
          d="M3.5 7.278L12 11.556l8.5-4.278"
          stroke={icon}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Vertical center line */}
        <path
          d="M12 21V11.556"
          stroke={icon}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Top ribbon */}
        <path
          d="M8 5.14L16 9.42"
          stroke={icon}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Initials */}
      <span
        className="font-bold leading-none tracking-wide"
        style={{
          color: text,
          fontSize: "clamp(8px, 22%, 18px)",
        }}
      >
        {initials}
      </span>
    </div>
  );
};

export default ProductImagePlaceholder;
