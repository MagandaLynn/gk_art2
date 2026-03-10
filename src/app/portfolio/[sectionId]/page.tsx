"use client";

import { use } from "react";
import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";
import SectionGallery from "@/components/SectionGallery";

export default function SectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = use(params);
  const { data, ready } = useSiteData();
  const section = data.sections.find((item) => item.id === sectionId);

  if (!ready) {
    return (
      <div className="space-y-6">
        <Link className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]" href="/portfolio">
          Back to portfolio
        </Link>
        <p className="text-sm text-[var(--muted)]">Loading section…</p>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="space-y-6">
        <Link className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]" href="/portfolio">
          Back to portfolio
        </Link>
        <p className="text-sm text-[var(--muted)]">Section not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]" href="/portfolio">
        Back to portfolio
      </Link>
      <SectionGallery section={section} />
    </div>
  );
}
