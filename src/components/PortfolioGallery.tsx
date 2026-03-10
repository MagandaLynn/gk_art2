"use client";

import { useMemo, useState } from "react";
import type { PortfolioSection, SiteData } from "@/data/siteData";

type LightboxState = {
  sectionId: string;
  index: number;
};

const getSectionImages = (sections: PortfolioSection[], sectionId: string) => {
  return sections.find((section) => section.id === sectionId)?.images ?? [];
};

export default function PortfolioGallery({ data }: { data: SiteData }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const activeImages = useMemo(() => {
    if (!lightbox) {
      return [];
    }
    return getSectionImages(data.sections, lightbox.sectionId);
  }, [data.sections, lightbox]);

  const activeImage = lightbox ? activeImages[lightbox.index] : null;

  return (
    <div className="space-y-16">
      {data.sections.map((section) => (
        <section key={section.id} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)]">
              <img
                className="h-full w-full object-cover"
                src={section.coverImage}
                alt={`${section.title} cover`}
              />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div>
                <h3 className="heading-font text-3xl">{section.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {section.description}
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {section.images.length} pieces
              </p>
            </div>
          </div>
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {section.images.map((image, index) => (
              <button
                key={image.id}
                className="masonry-item group mb-6 w-full overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)] text-left transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                onClick={() => setLightbox({ sectionId: section.id, index })}
              >
                <img
                  className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  src={image.src}
                  alt={image.alt}
                />
              </button>
            ))}
          </div>
        </section>
      ))}

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
            <div className="mt-4 flex items-center justify-between text-white">
              <button
                className="rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-white"
                onClick={() =>
                  setLightbox((prev) => {
                    if (!prev) return prev;
                    const images = getSectionImages(data.sections, prev.sectionId);
                    const nextIndex =
                      (prev.index - 1 + images.length) % images.length;
                    return { ...prev, index: nextIndex };
                  })
                }
              >
                Previous
              </button>
              <span className="text-xs uppercase tracking-[0.2em]">
                {lightbox.index + 1} / {activeImages.length}
              </span>
              <button
                className="rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-white"
                onClick={() =>
                  setLightbox((prev) => {
                    if (!prev) return prev;
                    const images = getSectionImages(data.sections, prev.sectionId);
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
