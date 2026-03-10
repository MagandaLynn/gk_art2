"use client";

import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";

export default function PortfolioPage() {
  const { data } = useSiteData();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="heading-font text-4xl">{data.portfolioIntro.title}</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {data.portfolioIntro.description}
        </p>
      </header>
      <section className="columns-1 gap-6 md:columns-2">
        {data.sections.map((section) => (
          <div key={section.id} className="masonry-item mb-6">
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
