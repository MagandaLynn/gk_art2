"use client";

import Link from "next/link";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { useSiteData } from "@/hooks/useSiteData";

export default function Home() {
  const { data } = useSiteData();

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_1.6fr]">
        <div className="flex flex-col justify-center gap-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Comic & illustration portfolio
          </p>
          <h1 className="heading-font text-5xl md:text-6xl">
            {data.artist.name}
          </h1>
          <p className="max-w-xl text-base text-[var(--muted)]">
            {data.artist.tagline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-[var(--border)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              href="/portfolio"
            >
              View portfolio
            </Link>
            <Link
              className="rounded-full border border-[var(--border)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              href="/contact"
            >
              Get in touch
            </Link>
          </div>
        </div>
        <div className="lg:translate-y-6">
          <FeaturedCarousel data={data} />
        </div>
      </section>

    </div>
  );
}
