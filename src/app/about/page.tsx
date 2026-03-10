"use client";

import { useSiteData } from "@/hooks/useSiteData";

export default function AboutPage() {
  const { data } = useSiteData();

  const aboutHtml = data.artist.bioHtml.replace(/\n/g, "<br />");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="heading-font text-4xl">{data.pageCopy.aboutTitle}</h1>
        <p className="text-sm text-[var(--muted)]">
          {data.pageCopy.aboutDescription}
        </p>
      </header>
      <section className="max-w-full sm:max-w-lg lg:max-w-md">
        <div
          className="rich-text text-xl leading-9 text-[var(--foreground)]"
          dangerouslySetInnerHTML={{ __html: aboutHtml }}
        />
      </section>
    </div>
  );
}
