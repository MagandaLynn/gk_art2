"use client";

import { useEffect, useState } from "react";
import { defaultSiteData, type SiteData } from "@/data/siteData";
import { hasStoredSiteData, loadSiteData, saveSiteData } from "@/lib/siteStorage";

const SITE_DATA_EVENT = "artist-site-data-updated";

export const useSiteData = () => {
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (hasStoredSiteData()) {
        const stored = loadSiteData();
        setData(stored);
        setReady(true);
        return;
      }

      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as SiteData;
          setData(payload);
          saveSiteData(payload);
          setReady(true);
          return;
        }
        const errorText = await response.text();
        console.warn("Failed to load site data", response.status, errorText);
      } catch {
        // ignore fetch errors
      }

      setData(defaultSiteData);
      setReady(true);
    };

    void load();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setData(loadSiteData());
    };

    window.addEventListener(SITE_DATA_EVENT, handleUpdate);
    return () => window.removeEventListener(SITE_DATA_EVENT, handleUpdate);
  }, []);

  const updateData = (next: SiteData) => {
    setData(next);
    saveSiteData(next);
    window.dispatchEvent(new Event(SITE_DATA_EVENT));
  };

  return { data, updateData, ready };
};
