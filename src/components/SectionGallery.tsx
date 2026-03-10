"use client";

import { useMemo, useState } from "react";
import type { PortfolioSection } from "@/data/siteData";

type LightboxState = {
  index: number;
};

export default function SectionGallery({ section }: { section: PortfolioSection }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const images = useMemo(() => {
    return section.images;
  }, [section.images]);

  const activeImage = lightbox ? images[lightbox.index] : null;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="heading-font text-4xl">{section.title}</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          {section.description}
        </p>
      </header>

      <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            className="masonry-item group mb-6 w-full overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)] text-left transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            onClick={() => setLightbox({ index })}
          >
            <img
              className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              src={image.src}
              alt={image.alt}
            />
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {image.alt}
              </p>
              {image.description ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {image.description}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {lightbox && activeImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="relative w-full max-w-5xl">
            <button
              className="absolute -top-10 right-0 text-sm font-semibold uppercase tracking-[0.2em] text-white"
              onClick={() => setLightbox(null)}
            >
              Close
            </button>
            <div className="overflow-hidden rounded-3xl bg-black">
              <img
                className="h-[70vh] w-full object-contain"
                src={activeImage.src}
                alt={activeImage.alt}
              />
            </div>
            <div className="mt-4 space-y-2 text-white">
              <p className="text-sm font-semibold">{activeImage.alt}</p>
              {activeImage.description ? (
                <p className="text-sm text-white/80">
                  {activeImage.description}
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex items-center justify-between text-white">
              <button
                className="rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-white"
                onClick={() =>
                  setLightbox((prev) => {
                    if (!prev) return prev;
                    const nextIndex =
                      (prev.index - 1 + images.length) % images.length;
                    return { ...prev, index: nextIndex };
                  })
                }
              >
                Previous
              </button>
              <span className="text-xs uppercase tracking-[0.2em]">
                {lightbox.index + 1} / {images.length}
              </span>
              <button
                className="rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-white"
                onClick={() =>
                  setLightbox((prev) => {
                    if (!prev) return prev;
                    const nextIndex = (prev.index + 1) % images.length;
                    return { ...prev, index: nextIndex };
                  })
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
