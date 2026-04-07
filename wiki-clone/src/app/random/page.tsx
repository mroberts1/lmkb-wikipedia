"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import allSlugs from "@/lib/slugs.json";

export default function RandomPage() {
  const router = useRouter();
  useEffect(() => {
    const slug = allSlugs[Math.floor(Math.random() * allSlugs.length)];
    router.replace(`/wiki/${slug}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ fontFamily: "sans-serif" }}>
      <p>Redirecting to a random article...</p>
    </div>
  );
}
