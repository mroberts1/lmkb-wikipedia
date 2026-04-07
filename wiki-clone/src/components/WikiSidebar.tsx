import Link from "next/link";

interface SidebarProps {
  categories: { name: string; slug: string; count: number }[];
}

export default function WikiSidebar({ categories }: SidebarProps) {
  return (
    <nav className="w-[160px] shrink-0 text-[15.75px] pr-4" style={{ fontFamily: "sans-serif" }}>
      {/* Main navigation */}
      <div className="mb-4">
        <h3 className="text-[#54595d] text-[18.75px] font-bold mb-1 px-2">Navigation</h3>
        <ul className="list-none m-0 p-0">
          <li>
            <Link href="/" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Main page
            </Link>
          </li>
          <li>
            <Link href="/wiki/Master_Index" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Master Index
            </Link>
          </li>
          <li>
            <Link href="/random" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Random article
            </Link>
          </li>
        </ul>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <h3 className="text-[#54595d] text-[18.75px] font-bold mb-1 px-2">Categories</h3>
        <ul className="list-none m-0 p-0">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline"
              >
                {cat.name} ({cat.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Topic indexes */}
      <div className="mb-4">
        <h3 className="text-[#54595d] text-[18.75px] font-bold mb-1 px-2">Topic Indexes</h3>
        <ul className="list-none m-0 p-0">
          <li>
            <Link href="/wiki/New_Media_Theory" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              New Media Theory
            </Link>
          </li>
          <li>
            <Link href="/wiki/Software_Studies_Index" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Software Studies
            </Link>
          </li>
          <li>
            <Link href="/wiki/Digital_Cinema_Index" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Digital Cinema
            </Link>
          </li>
          <li>
            <Link href="/wiki/Cultural_Analytics_Index" className="block px-2 py-0.5 text-[#0645ad] no-underline hover:underline">
              Cultural Analytics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
