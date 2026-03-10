"use client";

import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";
import SocialLinks from "@/components/SocialLinks";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { data } = useSiteData();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8">
          <div>
            <Link className="heading-font text-2xl tracking-[0.12em]" href="/">
              {data.artist.name}
            </Link>
          </div>
          <nav className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            <Link className="transition hover:text-[var(--foreground)]" href="/portfolio">
              Portfolio
            </Link>
            <Link className="transition hover:text-[var(--foreground)]" href="/about">
              About
            </Link>
            <Link className="transition hover:text-[var(--foreground)]" href="/contact">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-14">{children}</main>
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {data.artist.name}. All rights reserved.</span>
          <SocialLinks links={data.socials} />
        </div>
      </footer>
    </div>
  );
}
