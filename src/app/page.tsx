import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-3xl font-bold">Welcome to PyCheck</h1>
          <div className="mt-6">
            <Link 
              href="/examples" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-lg font-medium transition-colors"
            >
              View Examples
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
