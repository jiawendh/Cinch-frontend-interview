import CopyLinkButton from '@/components/ShortLinkItem/CopyLinkButton';
import TestLinkButton from '@/components/ShortLinkItem/TestLinkButton';
import LinkTooltip from '@/components/ShortLinkItem/LinkTooltip';
import { ShortLinkProps } from '@/types';

export default function ShortLinkItem({ link }: ShortLinkProps) {
  return (
    <tr key={link.id} className="border-t border-zinc-700">
      <td className="p-1 md:p-2">
        <LinkTooltip url={link.original_url} />
      </td>

      <td className="p-1 md:p-2">
        <LinkTooltip url={link.short_url} />
      </td>

      <td className="p-1 md:p-2 text-sm text-gray-600">
        {new Date(link.created_at).toLocaleString()}
      </td>

      <td className="p-2">
        <div className="text-center flex gap-1.5 min-w-50 pr-5 sm:pr-0">
          <TestLinkButton url={link.short_url} />
          <CopyLinkButton url={link.short_url} id={link.id} />
        </div>
      </td>
    </tr>
  );
}
