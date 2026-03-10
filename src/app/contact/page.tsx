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
        {data.contactLinks.length ? (
          <div className="flex flex-wrap items-center gap-3">
            {data.contactLinks.map((link) => (
              <a
                key={link.id}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.url.startsWith("mailto:") ? undefined : "noreferrer"}
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
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
