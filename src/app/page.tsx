import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-col gap-[32px] items-center sm:items-start">
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
                href="/courses" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-lg font-medium transition-colors"
              >
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto">
        <div className="flex justify-center items-center">
          <Link 
            href="/teacher" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm underline transition-colors"
          >
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
