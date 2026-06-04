export default function Home() {
  console.log("=== SERVER COMPONENT RUNNING ===");
  console.log("I run ONLY on the server terminal.");
  console.log("Open your browser dev tools - I am NOT there!");
  console.log("=================================");

  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 space-y-4">
      <h1 className="text-2xl font-bold">1. Home Page (Server Component)</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Check your **terminal console** where `pnpm dev` is running. You will see the server logs there.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Check your **browser console** (F12) — notice that those logs are missing!
      </p>
    </div>
  );
}
