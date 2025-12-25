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

export type ShortLink = {
  id: string;
  original_url: string;
  short_url: string;
  created_at: string;
};

export type ShortLinkProps = {
  link: ShortLink;
}
