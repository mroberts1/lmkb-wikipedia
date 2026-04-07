import Link from "next/link";
import WikiHeader from "@/components/WikiHeader";
import WikiSidebar from "@/components/WikiSidebar";
import { getAllArticles } from "@/lib/wiki";

export default async function Home() {
  const articles = await getAllArticles();

  const categoryMap = new Map<string, number>();
  for (const a of articles) {
    if (a.category) {
      categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1);
    }
  }
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), slug: name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const concepts = articles.filter((a) => a.category === "concepts");
  const sources = articles.filter((a) => a.category === "sources");
  const indexes = articles.filter((a) => a.category === "indexes");

  return (
    <div className="min-h-screen">
      <WikiHeader />
      <div className="max-w-[1200px] mx-auto flex mt-0">
        <WikiSidebar categories={categories} />
        <main className="flex-1 bg-white border-l border-[#a2a9b1] px-6 py-4 min-h-[80vh]">
          <h1
            className="text-[1.8em] font-normal border-b border-[#a2a9b1] pb-1 mb-4"
            style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
          >
            Lev Manovich Knowledge Base
          </h1>

          <p className="mb-4" style={{ fontFamily: "sans-serif", fontSize: "14px" }}>
            Welcome to the <strong>Lev Manovich Knowledge Base</strong> (LMKB), a comprehensive wiki covering
            Lev Manovich&apos;s writings on new media theory, digital cinema, software studies, and cultural analytics
            from 1991 to 2008. The wiki contains <strong>{articles.length}</strong> articles across{" "}
            <strong>{categories.length}</strong> categories.
          </p>

          {/* Featured concepts */}
          <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 mb-5">
            <h2
              className="text-[1.2em] font-normal m-0 mb-2 border-b border-[#c8ccd1] pb-1"
              style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
            >
              Core Concepts ({concepts.length})
            </h2>
            <div className="columns-2 gap-4" style={{ fontFamily: "sans-serif", fontSize: "13px" }}>
              {concepts
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((article) => (
                  <div key={article.slug} className="mb-1">
                    <Link href={`/wiki/${article.slug}`} className="text-[#0645ad] no-underline hover:underline">
                      {article.title}
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          {/* Topic Indexes */}
          <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 mb-5">
            <h2
              className="text-[1.2em] font-normal m-0 mb-2 border-b border-[#c8ccd1] pb-1"
              style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
            >
              Topic Indexes ({indexes.length})
            </h2>
            <div style={{ fontFamily: "sans-serif", fontSize: "13px" }}>
              {indexes
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((article) => (
                  <div key={article.slug} className="mb-1">
                    <Link href={`/wiki/${article.slug}`} className="text-[#0645ad] no-underline hover:underline">
                      {article.title}
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          {/* Source articles by year */}
          <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 mb-5">
            <h2
              className="text-[1.2em] font-normal m-0 mb-2 border-b border-[#c8ccd1] pb-1"
              style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
            >
              Source Summaries ({sources.length})
            </h2>
            <div style={{ fontFamily: "sans-serif", fontSize: "13px" }}>
              <table className="border-collapse w-full">
                <thead>
                  <tr>
                    <th className="text-left border-b border-[#a2a9b1] pb-1 pr-4 w-[60px]">Year</th>
                    <th className="text-left border-b border-[#a2a9b1] pb-1">Article</th>
                  </tr>
                </thead>
                <tbody>
                  {sources
                    .sort((a, b) => {
                      const yearA = (a.frontmatter.date as number) || 0;
                      const yearB = (b.frontmatter.date as number) || 0;
                      return yearA - yearB || a.title.localeCompare(b.title);
                    })
                    .map((article) => (
                      <tr key={article.slug}>
                        <td className="pr-4 py-0.5 text-[#54595d]">
                          {(article.frontmatter.date as number) || ""}
                        </td>
                        <td className="py-0.5">
                          <Link
                            href={`/wiki/${article.slug}`}
                            className="text-[#0645ad] no-underline hover:underline"
                          >
                            {article.title}
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
