import { defaultSiteData, type SiteData } from "@/data/siteData";

const STORAGE_KEY = "artist-site-data";

export const loadSiteData = (): SiteData => {
  if (typeof window === "undefined") {
    return defaultSiteData;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultSiteData;
  }

  try {
    const parsed = JSON.parse(stored) as SiteData;
    return { ...defaultSiteData, ...parsed };
  } catch {
    return defaultSiteData;
  }
};

export const saveSiteData = (data: SiteData) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearSiteData = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
