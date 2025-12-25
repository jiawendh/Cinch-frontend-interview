'use client';

import { useState } from "react";
import UrlShortenerForm from "@/components/UrlShortenerForm/UrlShortenerForm";
import ShortLinksList from "@/components/ShortLinksList/ShortLinksList";
import History from "@/icons/history";
import Cross from "@/icons/cross";

export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const toggleHistory = () => {
    setIsHistoryOpen((prev) => !prev);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 gap-y-5 bg-zinc-50 dark:bg-black sm:items-start">
        <section className="flex flex-col w-full items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight pl-2 text-black dark:text-zinc-50">
            Shorten a link.
          </h1>
          <UrlShortenerForm />
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
        <section className={"transition-opacity duration-300 " + (isHistoryOpen ? "opacity-100" : "opacity-0")}>
          <ShortLinksList isOpen={isHistoryOpen} />
        </section>
      </main>
    </div>
  );
}
