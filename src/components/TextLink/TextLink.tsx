import { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface TextLinkProps {
  to: string;
  children: ReactNode;
  stopPropagation?: boolean;
}

const TextLink: FC<TextLinkProps> = ({ to, children, stopPropagation }) => {
  return (
    <Link
      to={to}
      className="underline hover:text-blue-300"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {children}
    </Link>
  );
};

export default TextLink;
