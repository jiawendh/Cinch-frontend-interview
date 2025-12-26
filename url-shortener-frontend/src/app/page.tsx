'use client';

import { useState } from "react";
import UrlShortenerForm from "@/components/UrlShortenerForm/UrlShortenerForm";
import ShortLinksList from "@/components/ShortLinksList/ShortLinksList";
import { History, Cross } from "@/icons";
import { ShortLink } from '@/types';

export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [links, setLinks] = useState<ShortLink[]>([]);

  const toggleHistory = () => {
    setIsHistoryOpen((prev) => !prev);
  };

  const handleNewLink = (newLink: ShortLink) => {
    setLinks((prev) => [newLink, ...prev]);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center pt-15 sm:pt-20 pb-10 px-8 sm:px-16 gap-y-5 bg-black sm:items-start">
        {/* Enter original URL */}
        <section className="flex flex-col w-full items-center gap-6 sm:pt-30 sm:items-start text-zinc-400">
          <h1 className="text-left w-full text-3xl font-semibold leading-10 tracking-tight pl-2 text-zinc-50">
            Shorten a link.
          </h1>
          <UrlShortenerForm onCreated={handleNewLink} />
        </section>
        <section className="flex items-center gap-4 text-base font-medium w-full">
          <hr className="border-zinc-800 grow" />
          {/* Toggle history button */}
          <button
            onClick={toggleHistory}
            className="p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
          >
            {isHistoryOpen ?
              <Cross height={16} width={16} className={"stroke-zinc-500"} /> :
              <History height={16} width={16} className={"stroke-zinc-500"} />
            }
          </button>
        </section>
        {/* History list */}
        <section className={"h-70 w-full overflow-hidden transition-opacity duration-300 " + (isHistoryOpen ? "opacity-100" : "opacity-0")}>
          <div className="box-content h-full w-full overflow-y-scroll pr-5 pb-10">
            <ShortLinksList links={links} setLinks={setLinks} isOpen={isHistoryOpen} />
          </div>
        </section>
      </main>
    </div>
  );
}
