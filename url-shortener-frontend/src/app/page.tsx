import Image from "next/image";
import ShortenForm from "../components/ShortenForm";
import History from "../icons/history";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 gap-y-5 bg-zinc-50 dark:bg-black sm:items-start">
        <div className="flex flex-col w-full items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight pl-2 text-black dark:text-zinc-50">
            Shorten a link.
          </h1>
          <ShortenForm />
        </div>
        <div className="flex items-center gap-4 text-base font-medium w-full">
          <hr className="border-zinc-800 grow" />
          <a
            className="p-1.5 rounded-full hover:bg-zinc-800"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <History height={16} width={16} className={"stroke-zinc-500"} />
          </a>
        </div>
      </main>
    </div>
  );
}
