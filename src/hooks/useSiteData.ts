"use client";

import { useEffect, useState } from "react";
import { defaultSiteData, type SiteData } from "@/data/siteData";
import { hasStoredSiteData, loadSiteData, saveSiteData } from "@/lib/siteStorage";

const SITE_DATA_EVENT = "artist-site-data-updated";

type UseSiteDataOptions = {
  preferLocalCache?: boolean;
};

export const useSiteData = ({ preferLocalCache = false }: UseSiteDataOptions = {}) => {
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (preferLocalCache && hasStoredSiteData()) {
        setData(loadSiteData());
        setReady(true);
        return;
      }

      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as SiteData;
          const stored = hasStoredSiteData() ? loadSiteData() : null;
          const serverVersion = payload.lastPublished ?? 0;
          const localVersion = stored?.lastPublished ?? 0;
          if (!stored || serverVersion > localVersion) {
            setData(payload);
            saveSiteData(payload);
          } else {
            setData(stored);
          }
          setReady(true);
          return;
        }
        const errorText = await response.text();
        console.warn("Failed to load site data", response.status, errorText);
      } catch {
        // network error — fall back to cache if available
        if (hasStoredSiteData()) {
          setData(loadSiteData());
          setReady(true);
          return;
        }
      }

      setData(defaultSiteData);
      setReady(true);
    };

    void load();
  }, [preferLocalCache]);

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
