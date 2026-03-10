"use client";

import { useSiteData } from "@/hooks/useSiteData";

export default function ContactPage() {
  const { data } = useSiteData();

  const contactHtml = data.artist.contactHtml.replace(/\n/g, "<br />");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="heading-font text-4xl">{data.pageCopy.contactTitle}</h1>
        <p className="text-sm text-[var(--muted)]">
          {data.pageCopy.contactDescription}
        </p>
      </header>
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
        <div
          className="rich-text text-base leading-7 text-[var(--foreground)]"
          dangerouslySetInnerHTML={{ __html: contactHtml }}
        />
      </section>
    </div>
  );
}
