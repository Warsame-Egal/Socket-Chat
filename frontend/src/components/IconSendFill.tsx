// Wrapper around a send icon with optional click handler
import { HiPaperAirplane } from "react-icons/hi";
import { FC } from "react";

interface Props {
  onClick?: () => void;
  className?: string;
}

const IconSendFill: FC<Props> = ({ onClick, className }) => {
  return (
    <HiPaperAirplane
      onClick={onClick}
      className={className || "w-6 h-6 cursor-pointer text-white"}
    />
  );
};

export default IconSendFill;
