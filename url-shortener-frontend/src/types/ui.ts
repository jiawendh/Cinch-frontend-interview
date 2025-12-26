import { Dispatch, SetStateAction } from 'react';
import type { ShortLink } from '@/types';

export interface IconProps {
  height?: number;
  width?: number;
  className?: string;
}

export type HistoryProps = {
  isOpen: boolean;
  links: ShortLink[];
  setLinks: Dispatch<SetStateAction<ShortLink[]>>;
};
