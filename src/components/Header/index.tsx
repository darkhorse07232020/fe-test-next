"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Launches" },
  { href: "/favorites", label: "Favorites" },
  { href: "/analytics", label: "Analytics" },
  { href: "/compare", label: "Compare" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800/80 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/90 text-sm font-semibold text-black shadow-lg shadow-sky-500/40">
            SX
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-50">
              SpaceX Explorer
            </span>
            <span className="text-xs text-zinc-400">
              Launches, details & favorites
            </span>
          </div>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isActive
                    ? "bg-sky-500 text-black"
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

