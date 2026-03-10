"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteData } from "@/data/siteData";

export default function FeaturedCarousel({ data }: { data: SiteData }) {
  const featured = useMemo(() => {
    return data.sections.flatMap((section) =>
      section.images
        .filter((image) => image.highlighted)
        .map((image) => ({
          ...image,
          sectionTitle: section.title,
        }))
    );
  }, [data.sections]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)] text-sm text-[var(--muted)]">
        Mark images as highlighted to feature them here.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--card)]">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {featured.map((item) => (
            <div key={item.id} className="relative min-w-full">
              <img
                className="h-[22rem] w-full object-cover md:h-[30rem]"
                src={item.src}
                alt={item.alt}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white md:p-10">
                <p className="text-xs uppercase tracking-[0.3em]">Featured</p>
                <h2 className="heading-font text-4xl md:text-5xl">
                  {item.sectionTitle}
                </h2>
                <p className="mt-2 text-sm text-white/80">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        <div className="flex gap-2">
          {featured.map((item, idx) => (
            <button
              key={item.id}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === index
                  ? "bg-[var(--foreground)]"
                  : "bg-[var(--border)]"
              }`}
              onClick={() => setIndex(idx)}
              aria-label={`Show featured image ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            className="transition hover:text-[var(--foreground)]"
            onClick={() =>
              setIndex((prev) => (prev - 1 + featured.length) % featured.length)
            }
          >
            Prev
          </button>
          <button
            className="transition hover:text-[var(--foreground)]"
            onClick={() => setIndex((prev) => (prev + 1) % featured.length)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
