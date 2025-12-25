import { ComponentType } from "react";
import { IconProps } from "@/types";

export type ButtonProps = {
  button_url?: string;
  button_text?: string;
  className?: string;
  button_icon?: ComponentType<IconProps>;
};

export type LinkProps = {
  url: string;
  id?: string;
};
