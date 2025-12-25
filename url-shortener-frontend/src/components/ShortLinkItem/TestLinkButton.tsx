import SmallButton from '@/components/common/SmallButton';
import { ExternalLink } from '@/icons';
import { LinkProps } from '@/types';

export default function TestLinkButton({ url } : LinkProps) {
  return (
    <SmallButton button_url={url} button_icon={ExternalLink} button_text="Test Link" />
  );
}
