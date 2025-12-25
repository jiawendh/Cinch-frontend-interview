import { LinkProps } from "@/types"

export default function LinkTooltip({ url } : LinkProps) {
  return (
    <p className="text-zinc-400 group relative">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className='block max-w-30 truncate'
      >
        {url}
      </a>
      <span className='absolute -top-9 left-0 -z-1 bg-black border-zinc-700 border px-1.5 py-1 rounded text-zinc-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:z-10'>{url}</span>
    </p>
  );
}
