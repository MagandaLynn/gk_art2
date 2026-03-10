"use client";

import { useEffect, useState } from "react";
import { defaultSiteData, type SiteData } from "@/data/siteData";
import { loadSiteData, saveSiteData } from "@/lib/siteStorage";

const SITE_DATA_EVENT = "artist-site-data-updated";

export const useSiteData = () => {
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadSiteData();
    setData(stored);
    setReady(true);
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
