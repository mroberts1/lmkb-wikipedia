import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const WIKI_DIR = path.join(process.cwd(), "..", "data");

export interface WikiArticle {
  slug: string;
  title: string;
  content: string;
  htmlContent: string;
  frontmatter: Record<string, unknown>;
  category: string;
}

function getAllMdFiles(dir: string, category = ""): { filepath: string; category: string }[] {
  const results: { filepath: string; category: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllMdFiles(fullPath, entry.name));
    } else if (entry.name.endsWith(".md")) {
      results.push({ filepath: fullPath, category });
    }
  }
  return results;
}

function slugify(name: string): string {
  return name
    .replace(/\.md$/, "")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_");
}

// Normalize for fuzzy matching: lowercase, strip articles/punctuation, collapse spaces
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveWikilinks(
  htmlStr: string,
  articleMap: Map<string, string>,
  normalizedMap: Map<string, string>,
  allSlugs: Set<string>
): string {
  return htmlStr.replace(/\[\[([^\]]+)\]\]/g, (_, linkText: string) => {
    const trimmed = linkText.trim();

    // 1. Exact match by title or alias
    const exactSlug = articleMap.get(trimmed);
    if (exactSlug) {
      return `<a href="/wiki/${exactSlug}" class="wikilink">${trimmed}</a>`;
    }

    // 2. Normalized fuzzy match
    const normalizedSlug = normalizedMap.get(normalize(trimmed));
    if (normalizedSlug) {
      return `<a href="/wiki/${normalizedSlug}" class="wikilink">${trimmed}</a>`;
    }

    // 3. Try slugifying directly and check if it exists
    const directSlug = slugify(trimmed);
    if (allSlugs.has(directSlug)) {
      return `<a href="/wiki/${directSlug}" class="wikilink">${trimmed}</a>`;
    }

    // 4. Missing article — red link, no href to avoid 404
    return `<span class="wikilink-missing" title="Article does not exist">${trimmed}</span>`;
  });
}

let cachedArticles: WikiArticle[] | null = null;

function buildArticleMap(articles: WikiArticle[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const article of articles) {
    // Map by title
    map.set(article.title, article.slug);
    // Map by filename-derived name
    const nameFromSlug = article.slug.replace(/_/g, " ");
    map.set(nameFromSlug, article.slug);
    // Map aliases
    const aliases = article.frontmatter.aliases as string[] | undefined;
    if (aliases) {
      for (const alias of aliases) {
        map.set(alias, article.slug);
      }
    }
  }
  return map;
}

function buildNormalizedMap(articles: WikiArticle[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const article of articles) {
    map.set(normalize(article.title), article.slug);
    map.set(normalize(article.slug.replace(/_/g, " ")), article.slug);
    const aliases = article.frontmatter.aliases as string[] | undefined;
    if (aliases) {
      for (const alias of aliases) {
        map.set(normalize(alias), article.slug);
      }
    }
  }
  return map;
}

export async function getAllArticles(): Promise<WikiArticle[]> {
  if (cachedArticles) return cachedArticles;

  const files = getAllMdFiles(WIKI_DIR);
  const articles: WikiArticle[] = [];

  for (const { filepath, category } of files) {
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data, content } = matter(raw);
    const slug = slugify(path.basename(filepath));
    const title = (data.title as string) || path.basename(filepath, ".md");

    const processed = await remark().use(html, { sanitize: false }).process(content);
    const htmlContent = processed.toString();

    articles.push({
      slug,
      title,
      content,
      htmlContent,
      frontmatter: data,
      category,
    });
  }

  cachedArticles = articles;
  const articleMap = buildArticleMap(articles);
  const normalizedMap = buildNormalizedMap(articles);
  const allSlugs = new Set(articles.map((a) => a.slug));

  // Resolve wikilinks in all articles
  for (const article of cachedArticles) {
    article.htmlContent = resolveWikilinks(article.htmlContent, articleMap, normalizedMap, allSlugs);
  }

  return cachedArticles;
}

export async function getArticleBySlug(slug: string): Promise<WikiArticle | undefined> {
  const articles = await getAllArticles();
  return articles.find((a) => a.slug === slug);
}

export async function getArticlesByCategory(category: string): Promise<WikiArticle[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.category === category);
}

export async function searchArticles(query: string): Promise<WikiArticle[]> {
  const articles = await getAllArticles();
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
  );
}

// Match a source summary article to its fulltext counterpart
export async function findFulltextFor(sourceArticle: WikiArticle): Promise<WikiArticle | undefined> {
  const articles = await getAllArticles();
  const fulltexts = articles.filter((a) => a.category === "fulltext");
  const srcNorm = normalize(sourceArticle.title);

  // Try exact normalized match first
  let match = fulltexts.find((ft) => normalize(ft.title) === srcNorm);
  if (match) return match;

  // Strip author/year suffix from source title (e.g. "What is Digital Cinema - Manovich 1995")
  const stripped = sourceArticle.title.replace(/\s*-\s*Manovich\s*\d{4}$/, "").trim();
  const strippedNorm = normalize(stripped);
  match = fulltexts.find((ft) => normalize(ft.title) === strippedNorm);
  if (match) return match;

  // Try substring matching: does the fulltext title contain the key words?
  match = fulltexts.find((ft) => {
    const ftNorm = normalize(ft.title);
    return ftNorm.includes(strippedNorm) || strippedNorm.includes(ftNorm);
  });
  if (match) return match;

  // Try matching by year + significant words overlap
  const srcYear = sourceArticle.frontmatter.date as number | undefined;
  if (srcYear) {
    const yearMatches = fulltexts.filter(
      (ft) => (ft.frontmatter.year as number) === srcYear
    );
    const srcWords = new Set(strippedNorm.split(" ").filter((w) => w.length > 3));
    let bestMatch: WikiArticle | undefined;
    let bestScore = 0;
    for (const ft of yearMatches) {
      const ftWords = normalize(ft.title).split(" ").filter((w) => w.length > 3);
      const overlap = ftWords.filter((w) => srcWords.has(w)).length;
      const score = overlap / Math.max(srcWords.size, ftWords.length);
      if (score > bestScore && score >= 0.3) {
        bestScore = score;
        bestMatch = ft;
      }
    }
    if (bestMatch) return bestMatch;
  }

  return undefined;
}
