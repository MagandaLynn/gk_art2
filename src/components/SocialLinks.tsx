import type { SocialLink } from "@/data/siteData";

export default function SocialLinks({ links }: { links: SocialLink[] }) {
  if (!links.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <a
          key={link.id}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--button-bg)] px-3 py-1 text-xs font-medium text-[var(--button-fg)] transition hover:border-[var(--foreground)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
          href={link.url}
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden>{link.icon}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}
