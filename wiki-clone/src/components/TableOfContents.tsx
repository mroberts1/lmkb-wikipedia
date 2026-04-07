"use client";

import { useState } from "react";

interface TocItem {
  level: number;
  text: string;
  id: string;
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length < 3) return null;

  return (
    <div
      className="float-none bg-[#f8f9fa] border border-[#a2a9b1] p-3 mb-4 inline-block"
      style={{ fontFamily: "sans-serif", fontSize: "16.25px", minWidth: "200px" }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-[16.25px]">Contents</span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#0645ad] text-[18.75px] bg-transparent border-none cursor-pointer hover:underline ml-2"
        >
          [{collapsed ? "show" : "hide"}]
        </button>
      </div>
      {!collapsed && (
        <ol className="list-decimal pl-5 m-0">
          {items.map((item, i) => (
            <li
              key={i}
              className="py-0.5"
              style={{ marginLeft: (item.level - 2) * 16 }}
            >
              <a href={`#${item.id}`} className="text-[#0645ad] no-underline hover:underline">
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
