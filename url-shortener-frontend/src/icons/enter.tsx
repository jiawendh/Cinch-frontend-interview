import { IconProps } from "@/types";

export const Enter = ({ height = 24, width = 24, className }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"lucide lucide-corner-down-left-icon lucide-corner-down-left dark:invert " + className}>
        <path d="M20 4v7a4 4 0 0 1-4 4H4"/>
        <path d="m9 10-5 5 5 5"/>
    </svg>
  );
};
