"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WikiHeader() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header>
      {/* Top banner */}
      <div className="bg-white border-b border-[#a7d7f9]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex flex-col items-center">
              <div className="text-[18.75px] font-bold text-black" style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}>
                LMKB
              </div>
              <div className="text-[12.5px] text-[#54595d] tracking-wide">
                The Knowledge Base
              </div>
            </div>
            <div className="ml-2" style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}>
              <span className="text-lg text-black">Lev Manovich Knowledge Base</span>
            </div>
          </Link>
          <form onSubmit={handleSearch} className="flex items-center gap-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search LMKB"
              className="border border-[#a2a9b1] rounded-l px-2 py-1 text-sm w-[200px] focus:outline-none focus:border-[#36c]"
              style={{ fontFamily: "sans-serif" }}
            />
            <button
              type="submit"
              className="bg-white border border-[#a2a9b1] border-l-0 rounded-r px-3 py-1 text-sm cursor-pointer hover:bg-[#eaecf0]"
              style={{ fontFamily: "sans-serif" }}
            >
              Search
            </button>
          </form>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white border-b border-[#a2a9b1]">
        <div className="max-w-[1200px] mx-auto px-4">
          <nav className="flex gap-0 text-[16.25px]" style={{ fontFamily: "sans-serif" }}>
            <span className="px-3 py-1.5 border border-[#a2a9b1] border-b-white bg-white rounded-t text-[#202122] -mb-px">
              Article
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
