export default async function DataPage() {
  console.log("=== SERVER DATA FETCH START ===");
  console.log("I am fetching data SECURELY on the server!");
  console.log("================================");

  // Simulate an async fetch from a public API
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    next: { revalidate: 10 } // Cache/revalidate config
  });
  const data = await res.json();

  console.log("=== SERVER DATA FETCH COMPLETE ===");
  console.log("Data fetched successfully on the server:", data);
  console.log("==================================");

  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 space-y-4">
      <h1 className="text-2xl font-bold">3. Data Page (Server Fetch)</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page performs an asynchronous `fetch` inside a Server Component before rendering the HTML.
      </p>

      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <h2 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Fetched Data:</h2>
        <pre className="text-sm font-mono text-blue-600 dark:text-blue-400 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <p className="text-xs text-zinc-500">
        Check your server terminal to see the "START" and "COMPLETE" logs. The browser console will show absolutely nothing about this fetch.
      </p>
    </div>
  );
}
