"use client";

import { useEffect, useState } from "react";

export default function ClientPage() {
  const [count, setCount] = useState(0);

  // This prints in both terminal (during SSR pre-render) and browser console (during hydration)
  console.log("=== CLIENT COMPONENT RENDER ===");
  console.log("I run in BOTH the terminal (SSR) and the browser console!");
  console.log("===============================");

  useEffect(() => {
    // This runs strictly in the browser once mounted
    console.log("=== CLIENT COMPONENT MOUNTED (useEffect) ===");
    console.log("I run ONLY in the browser dev tools console.");
    console.log("=============================================");
  }, []);

  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 space-y-4">
      <h1 className="text-2xl font-bold">2. Client Component Page</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Check your **browser console** (F12). You will see the mounted logs and the click action logs here.
      </p>
      
      <div className="flex flex-col items-start gap-2">
        <button
          onClick={() => {
            console.log(`Click Action: Count bumped to ${count + 1}`);
            setCount(count + 1);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Count: {count}
        </button>
        <span className="text-xs text-zinc-500">
          Clicking this button triggers a click log. Notice this click log does NOT show in your server terminal.
        </span>
      </div>
    </div>
  );
}
