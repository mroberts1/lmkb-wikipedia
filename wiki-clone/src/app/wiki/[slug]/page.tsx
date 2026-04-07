import { notFound } from "next/navigation";
import WikiHeader from "@/components/WikiHeader";
import WikiSidebar from "@/components/WikiSidebar";
import TableOfContents from "@/components/TableOfContents";
import { getAllArticles, getArticleBySlug, findFulltextFor } from "@/lib/wiki";

function extractHeadings(html: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ level: parseInt(match[1]), text, id });
  }
  return headings;
}

function addIdsToHeadings(html: string): string {
  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/g, (_, level, attrs, content, closeLevel) => {
    const text = content.replace(/<[^>]*>/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${level}${attrs} id="${id}">${content}</h${closeLevel}>`;
  });
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

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

  const headings = extractHeadings(article.htmlContent);
  const htmlWithIds = addIdsToHeadings(article.htmlContent);

  // Build info box from frontmatter
  const fm = article.frontmatter;
  const infoItems: { label: string; value: string }[] = [];
  if (fm.source_type) infoItems.push({ label: "Type", value: String(fm.source_type) });
  if (fm.authors && Array.isArray(fm.authors)) infoItems.push({ label: "Author(s)", value: (fm.authors as string[]).join(", ") });
  if (fm.date) infoItems.push({ label: "Date", value: String(fm.date) });
  if (fm.tags && Array.isArray(fm.tags)) infoItems.push({ label: "Tags", value: (fm.tags as string[]).join(", ") });
  if (fm.aliases && Array.isArray(fm.aliases)) infoItems.push({ label: "Also known as", value: (fm.aliases as string[]).join(", ") });

  // Related articles
  const related = fm.related as string[] | undefined;

  // Extract source links from article body (## Sources section)
  const sourceLinks: { name: string; slug: string }[] = [];
  const sourceSectionMatch = article.content.match(/## Sources\s*\n([\s\S]*?)(?=\n## |\n---|$)/);
  if (sourceSectionMatch) {
    const sourceMatches = sourceSectionMatch[1].matchAll(/\[\[([^\]]+)\]\]/g);
    for (const m of sourceMatches) {
      const name = m[1].trim();
      const sSlug = name
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "_");
      sourceLinks.push({ name, slug: sSlug });
    }
  }

  // Check if this is a source article (category === "sources")
  const isSource = article.category === "sources";
  const externalUrl = fm.url as string | undefined;

  // For source pages: find concept articles that cite this source
  const conceptBacklinks: { name: string; slug: string }[] = [];
  // For source pages: find the matching full-text article
  let fulltextArticle: { title: string; slug: string } | null = null;
  if (isSource) {
    for (const a of articles) {
      if (a.category === "concepts") {
        const srcMatch = a.content.match(/## Sources\s*\n([\s\S]*?)(?=\n## |\n---|$)/);
        if (srcMatch && srcMatch[1].includes(article.title)) {
          conceptBacklinks.push({ name: a.title, slug: a.slug });
        }
        if (conceptBacklinks.every(c => c.slug !== a.slug)) {
          const slugName = article.slug.replace(/_/g, " ");
          if (a.content.includes(`[[${article.title}]]`) || a.content.includes(`[[${slugName}]]`)) {
            conceptBacklinks.push({ name: a.title, slug: a.slug });
          }
        }
      }
    }
    // Find matching full-text
    const ft = await findFulltextFor(article);
    if (ft) {
      fulltextArticle = { title: ft.title, slug: ft.slug };
    }
  }

  return (
    <div className="min-h-screen">
      <WikiHeader />
      <div className="max-w-[1200px] mx-auto flex mt-0">
        <WikiSidebar categories={categories} />
        <main className="flex-1 bg-white border-l border-[#a2a9b1] px-6 py-4 min-h-[80vh]">
          {/* Article title */}
          <h1
            className="text-[1.8em] font-normal border-b border-[#a2a9b1] pb-1 mb-2"
            style={{ fontFamily: "'Linux Libertine', Georgia, serif" }}
          >
            {article.title}
          </h1>

          {/* Category breadcrumb */}
          {article.category && (
            <div className="text-[12px] text-[#54595d] mb-3" style={{ fontFamily: "sans-serif" }}>
              Category: <span className="text-[#0645ad]">{article.category}</span>
            </div>
          )}

          {/* Source article banner — shown on concept/index pages that have sources */}
          {!isSource && sourceLinks.length > 0 && (
            <div
              className="bg-[#eaf3fb] border border-[#a2a9b1] px-4 py-3 mb-4 rounded-sm"
              style={{ fontFamily: "sans-serif", fontSize: "13px" }}
            >
              <span className="font-bold text-[13px]">Full-text source articles: </span>
              {sourceLinks.map((s, i) => (
                <span key={s.slug}>
                  {i > 0 && <span className="text-[#54595d]"> · </span>}
                  <a href={`/wiki/${s.slug}`} className="text-[#0645ad] no-underline hover:underline">
                    {s.name}
                  </a>
                </span>
              ))}
            </div>
          )}

          {/* Source page callout — links to concept articles that discuss this source */}
          {isSource && conceptBacklinks.length > 0 && (
            <div
              className="bg-[#eaf3fb] border border-[#a2a9b1] px-4 py-3 mb-4 rounded-sm"
              style={{ fontFamily: "sans-serif", fontSize: "13px" }}
            >
              <span className="font-bold text-[13px]">Main article{conceptBacklinks.length > 1 ? "s" : ""}: </span>
              {conceptBacklinks.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && <span className="text-[#54595d]"> · </span>}
                  <a href={`/wiki/${c.slug}`} className="text-[#0645ad] no-underline hover:underline font-bold">
                    {c.name}
                  </a>
                </span>
              ))}
            </div>
          )}

          {/* Full-text callout — shown on source summary pages */}
          {isSource && fulltextArticle && (
            <div
              className="bg-[#e8f5e9] border border-[#4caf50] px-4 py-3 mb-4 rounded-sm"
              style={{ fontFamily: "sans-serif", fontSize: "13px" }}
            >
              <span className="text-[13px]">📄 </span>
              <a href={`/wiki/${fulltextArticle.slug}`} className="text-[#0645ad] no-underline hover:underline font-bold text-[14px]">
                Read full text →
              </a>
            </div>
          )}

          {/* External URL banner — shown on source pages with a url */}
          {isSource && externalUrl && (
            <div
              className="bg-[#f6efe6] border border-[#a2a9b1] px-4 py-3 mb-4 rounded-sm"
              style={{ fontFamily: "sans-serif", fontSize: "13px" }}
            >
              <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-[#0645ad] no-underline hover:underline font-bold">
                Read original article ↗
              </a>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              {/* Table of Contents */}
              <TableOfContents items={headings} />

              {/* Article content */}
              <div
                className="wiki-content"
                dangerouslySetInnerHTML={{ __html: htmlWithIds }}
              />
            </div>

            {/* Info box (right sidebar for articles with metadata) */}
            {infoItems.length > 0 && (
              <div
                className="w-[240px] shrink-0"
                style={{ fontFamily: "sans-serif", fontSize: "13px" }}
              >
                <div className="border border-[#a2a9b1] bg-[#f8f9fa] mb-4">
                  <div className="bg-[#cee0f2] px-3 py-2 font-bold text-center text-[14px]">
                    {article.title}
                  </div>
                  <table className="w-full">
                    <tbody>
                      {infoItems.map((item) => (
                        <tr key={item.label} className="border-t border-[#a2a9b1]">
                          <th className="bg-[#e4e8ee] px-2 py-1.5 text-left font-bold text-[12px] w-[80px] align-top">
                            {item.label}
                          </th>
                          <td className="px-2 py-1.5 text-[12px]">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Source articles in infobox */}
                {!isSource && sourceLinks.length > 0 && (
                  <div className="border border-[#a2a9b1] bg-[#f8f9fa] mb-4">
                    <div className="bg-[#d4e8c2] px-3 py-2 font-bold text-center text-[13px]">
                      Full-Text Articles
                    </div>
                    <div className="p-2">
                      {sourceLinks.map((s) => (
                        <div key={s.slug} className="py-0.5">
                          <a href={`/wiki/${s.slug}`} className="text-[#0645ad] no-underline hover:underline text-[12px]">
                            {s.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related articles */}
                {related && related.length > 0 && (
                  <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
                    <div className="bg-[#cee0f2] px-3 py-2 font-bold text-center text-[13px]">
                      Related Articles
                    </div>
                    <div className="p-2">
                      {related.map((r, i) => {
                        const name = r.replace(/\[\[|\]\]/g, "");
                        const rSlug = name
                          .replace(/[^a-zA-Z0-9\s-]/g, "")
                          .replace(/\s+/g, "_");
                        return (
                          <div key={i} className="py-0.5">
                            <a href={`/wiki/${rSlug}`} className="text-[#0645ad] no-underline hover:underline text-[12px]">
                              {name}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
