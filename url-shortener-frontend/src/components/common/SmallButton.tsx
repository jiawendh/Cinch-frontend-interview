import { ButtonProps } from '@/types';

export default function SmallButton({
  button_url,
  button_icon: ButtonIcon,
  button_text,
  className,
  ...props
}: ButtonProps) {
  return (
    <a
      {...props}
      href={button_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1 w-full min-w-19 px-2 py-1.5 text-xs text-zinc-400 rounded-full transition-colors border hover:bg-[#1a1a1a] border border-solid border-white/[.145] hover:border-transparent cursor-pointer"
    >
      {ButtonIcon && <ButtonIcon height={12} width={12} className='stroke-zinc-500 cursor-pointer' />}
      <span>{button_text}</span>
    </a>
  );
}
