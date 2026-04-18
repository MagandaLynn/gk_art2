"use client";

import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";

export default function PortfolioPage() {
  const { data, ready } = useSiteData();

  if (!ready) {
    return (
      <div className="space-y-8">
        <header className="space-y-3">
          <div className="h-10 w-64 rounded-lg bg-[var(--border)] animate-pulse"></div>
          <div className="h-4 w-96 rounded-lg bg-[var(--border)] animate-pulse"></div>
        </header>
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[30px] bg-[var(--card)] overflow-hidden">
              <div className="h-72 bg-[var(--border)] animate-pulse md:h-96"></div>
              <div className="p-5 space-y-2">
                <div className="h-6 w-48 rounded-lg bg-[var(--border)] animate-pulse"></div>
                <div className="h-4 w-full rounded-lg bg-[var(--border)] animate-pulse"></div>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="heading-font text-4xl">{data.portfolioIntro.title}</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {data.portfolioIntro.description}
        </p>
      </header>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {data.sections.map((section) => (
          <div key={section.id}>
            <Link
              className="group block overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--card)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              href={`/portfolio/${section.id}`}
            >
              <img
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-96"
                src={section.coverImage}
                alt={`${section.title} cover`}
              />
              <div className="p-5">
                <h2 className="heading-font text-2xl">{section.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {section.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
