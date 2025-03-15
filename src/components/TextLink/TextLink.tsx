import { FC } from "react";
import { Link } from "react-router-dom";

interface TextLinkProps {
  link: string;
  text: string;
}

const TextLink: FC<TextLinkProps> = ({ link, text }) => {
  return (
    <Link
      to={link}
      className="border-b border-gray-500 hover:text-sky-600"
    >
      {text}
    </Link>
  );
};

export default TextLink;
