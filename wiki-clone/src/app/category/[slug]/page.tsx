import Link from "next/link";
import WikiHeader from "@/components/WikiHeader";
import WikiSidebar from "@/components/WikiSidebar";
import { getAllArticles, getArticlesByCategory } from "@/lib/wiki";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const categories = new Set(articles.map((a) => a.category).filter(Boolean));
  return Array.from(categories).map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await getAllArticles();
  const categoryArticles = await getArticlesByCategory(slug);

  const categoryMap = new Map<string, number>();
  for (const a of articles) {
    if (a.category) {
      categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1);
    }
  }
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), slug: name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const displayName = slug.charAt(0).toUpperCase() + slug.slice(1);

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
            Category: {displayName}
          </h1>
          <p className="mb-4 text-[17.5px]" style={{ fontFamily: "sans-serif" }}>
            {categoryArticles.length} article{categoryArticles.length !== 1 ? "s" : ""} in this category.
          </p>
          <div style={{ fontFamily: "sans-serif", fontSize: "17.5px" }}>
            {categoryArticles
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((article) => (
                <div key={article.slug} className="mb-2">
                  <Link
                    href={`/wiki/${article.slug}`}
                    className="text-[#0645ad] no-underline hover:underline"
                  >
                    {article.title}
                  </Link>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
