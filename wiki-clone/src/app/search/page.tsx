"use client";

import Link from "next/link";
import WikiHeader from "@/components/WikiHeader";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Client-side search: we'll use a static index generated at build time
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: "14px" }}>
      {query ? (
        <p className="mb-4">
          Searching for <strong>&quot;{query}&quot;</strong>. For best results, browse the{" "}
          <Link href="/wiki/Master_Index" className="text-[#0645ad] no-underline hover:underline">
            Master Index
          </Link>.
        </p>
      ) : (
        <p className="text-[#54595d]">Enter a search term above.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <WikiHeader />
      <div className="max-w-[1200px] mx-auto flex mt-0">
        <main className="flex-1 bg-white border-l border-[#a2a9b1] px-6 py-4 min-h-[80vh]">
          <h1
            className="text-[1.8em] font-normal border-b border-[#a2a9b1] pb-1 mb-4"
            style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
          >
            Search
          </h1>
          <Suspense fallback={<p>Loading...</p>}>
            <SearchResults />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
