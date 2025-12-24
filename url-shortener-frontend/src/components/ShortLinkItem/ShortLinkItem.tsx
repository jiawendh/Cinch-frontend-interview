import Copy from '@/utils/utils';

export default function ShortLinkItem({ link } : any) {
  return (
    <tr key={link.id} className="border-t border-zinc-700">
      <td className="p-2">
        <p className="text-zinc-400 group relative">
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className='block max-w-40 truncate'
          >
            {link.original_url}
          </a>
          <span className='absolute -top-9 left-0 -z-1 bg-black border-zinc-700 border px-1.5 py-1 rounded text-zinc-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:z-10'>{link.original_url}</span>
        </p>
      </td>

      <td className="p-2">
        <p className="text-zinc-400 group relative">
          <a
            href={link.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className='block max-w-40 truncate'
          >
            {link.short_url}
          </a>
          <span className='absolute -top-9 left-0 -z-1 bg-black border-zinc-700 border px-1.5 py-1 rounded text-zinc-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:z-10'>{link.short_url}</span>
        </p>
      </td>

      <td className="p-2 text-sm text-gray-600">
        {new Date(link.created_at).toLocaleString()}
      </td>

      <td className="p-2 text-center">
        <Copy link={link}/>
      </td>
    </tr>
  );
}
