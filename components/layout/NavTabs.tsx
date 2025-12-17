"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "NICHE FINDER", href: "/niche-finder" },
  { label: "KELOLA IDE", href: "/ideas" },
  { label: "NASKAH", href: "/story-builder" },
  { label: "METADATA", href: "/metadata" },
  { label: "THUMBNAIL PROMPT", href: "/thumbnail-prompt" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b-4 border-black px-6 py-3 flex flex-wrap gap-3 bg-[#fffdf4]">
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          // biar /story-builder?title=... juga kena active
          (pathname?.startsWith(tab.href) && tab.href !== "/");

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-4 py-2 border-2 border-black text-xs md:text-sm font-semibold uppercase tracking-wide
              ${
                isActive
                  ? "bg-black text-[#ffd84f]"
                  : "bg-white hover:bg-[#ffecc1]"
              }
              shadow-[4px_4px_0_0_rgba(0,0,0,1)]
              active:translate-x-[2px] active:translate-y-[2px]
              active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
