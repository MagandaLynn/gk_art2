"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultSiteData,
  type GalleryImage,
  type PortfolioSection,
  type SiteData,
  type SocialLink,
} from "@/data/siteData";
import { clearSiteData } from "@/lib/siteStorage";
import { useSiteData } from "@/hooks/useSiteData";

const ADMIN_AUTH_KEY = "artist-admin-auth";
const ADMIN_CODE_KEY = "artist-admin-code";

type NewImageDraft = {
  src: string;
  alt: string;
  description: string;
  highlighted: boolean;
};

export default function AdminPage() {
  const { data, updateData } = useSiteData();
  const [accessCode, setAccessCode] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [artistDraft, setArtistDraft] = useState({
    name: data.artist.name,
    tagline: data.artist.tagline,
  });
  const [portfolioDraft, setPortfolioDraft] = useState({
    title: data.portfolioIntro.title,
    description: data.portfolioIntro.description,
  });
  const [pageCopyDraft, setPageCopyDraft] = useState({
    aboutTitle: data.pageCopy.aboutTitle,
    aboutDescription: data.pageCopy.aboutDescription,
    contactTitle: data.pageCopy.contactTitle,
    contactDescription: data.pageCopy.contactDescription,
  });
  const [sectionDrafts, setSectionDrafts] = useState<
    Record<string, { title: string; description: string }>
  >({});
  const [bioDraft, setBioDraft] = useState(data.artist.bioHtml);
  const [contactDraft, setContactDraft] = useState(data.artist.contactHtml);
  const [newSection, setNewSection] = useState({
    title: "",
    description: "",
    coverImage: "",
  });
  const [newImageDrafts, setNewImageDrafts] = useState<
    Record<string, NewImageDraft>
  >({});
  const [newSocial, setNewSocial] = useState({
    label: "",
    url: "",
    icon: "✨",
  });
  const [newContactLink, setNewContactLink] = useState({
    label: "",
    url: "",
    icon: "✉️",
  });

  useEffect(() => {
    setIsAuthed(window.localStorage.getItem(ADMIN_AUTH_KEY) === "true");
    setAdminCode(window.localStorage.getItem(ADMIN_CODE_KEY) || "");
  }, []);

  useEffect(() => {
    setBioDraft(data.artist.bioHtml);
    setContactDraft(data.artist.contactHtml);
    setArtistDraft({
      name: data.artist.name,
      tagline: data.artist.tagline,
    });
    setPortfolioDraft({
      title: data.portfolioIntro.title,
      description: data.portfolioIntro.description,
    });
    setPageCopyDraft({
      aboutTitle: data.pageCopy.aboutTitle,
      aboutDescription: data.pageCopy.aboutDescription,
      contactTitle: data.pageCopy.contactTitle,
      contactDescription: data.pageCopy.contactDescription,
    });
    setSectionDrafts(
      data.sections.reduce((acc, section) => {
        acc[section.id] = {
          title: section.title,
          description: section.description,
        };
        return acc;
      }, {} as Record<string, { title: string; description: string }>)
    );
  }, [
    data.artist.bioHtml,
    data.artist.contactHtml,
    data.artist.name,
    data.artist.tagline,
    data.portfolioIntro.title,
    data.portfolioIntro.description,
    data.pageCopy.aboutTitle,
    data.pageCopy.aboutDescription,
    data.pageCopy.contactTitle,
    data.pageCopy.contactDescription,
    data.sections,
  ]);

  const featuredCount = useMemo(() => {
    return data.sections.reduce(
      (count, section) =>
        count + section.images.filter((image) => image.highlighted).length,
      0
    );
  }, [data.sections]);

  const handleLogin = () => {
    if (accessCode.trim() === data.adminAccessCode) {
      window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      window.localStorage.setItem(ADMIN_CODE_KEY, accessCode.trim());
      setIsAuthed(true);
      setAdminCode(accessCode.trim());
      setAccessCode("");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    window.localStorage.removeItem(ADMIN_CODE_KEY);
    setIsAuthed(false);
  };

  const uploadFile = async (file: File) => {
    const code = adminCode || accessCode || data.adminAccessCode;
    if (!code) {
      setUploadMessage("Missing admin access code. Please log in again.");
      throw new Error("Missing admin access code");
    }

    setUploadMessage("Uploading image...");
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        accessCode: code,
      }),
    });

    if (!response.ok) {
      setUploadMessage("Upload failed. Check AWS settings.");
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, fileUrl } = (await response.json()) as {
      uploadUrl: string;
      fileUrl: string;
    };

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      setUploadMessage("Upload failed while sending file.");
      throw new Error("Failed to upload file");
    }

    setUploadMessage("Upload complete.");
    return fileUrl;
  };

  const handlePlainPaste = (
    event: React.ClipboardEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const updateSection = (
    sectionId: string,
    updater: (section: PortfolioSection) => PortfolioSection
  ) => {
    const nextSections = data.sections.map((section) =>
      section.id === sectionId ? updater(section) : section
    );
    updateData({ ...data, sections: nextSections });
  };

  const moveSection = (index: number, direction: number) => {
    const nextSections = [...data.sections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= nextSections.length) {
      return;
    }
    const [removed] = nextSections.splice(index, 1);
    nextSections.splice(targetIndex, 0, removed);
    updateData({ ...data, sections: nextSections });
  };

  const removeSection = (sectionId: string) => {
    updateData({
      ...data,
      sections: data.sections.filter((section) => section.id !== sectionId),
    });
  };

  const addSection = () => {
    if (!newSection.title.trim()) {
      return;
    }
    const section: PortfolioSection = {
      id: `section-${Date.now()}`,
      title: newSection.title,
      description: newSection.description,
      coverImage: newSection.coverImage || "/portfolio-1.svg",
      images: [],
    };
    updateData({ ...data, sections: [...data.sections, section] });
    setNewSection({ title: "", description: "", coverImage: "" });
  };

  const addImage = (sectionId: string) => {
    const draft = newImageDrafts[sectionId];
    if (!draft?.src?.trim()) {
      return;
    }
    updateSection(sectionId, (section) => {
      const image: GalleryImage = {
        id: `img-${Date.now()}`,
        src: draft.src,
        alt: draft.alt || "Portfolio image",
        description: draft.description || "",
        highlighted: draft.highlighted ?? false,
      };
      return { ...section, images: [...section.images, image] };
    });
    setNewImageDrafts((prev) => ({
      ...prev,
      [sectionId]: { src: "", alt: "", description: "", highlighted: false },
    }));
  };

  const removeImage = (sectionId: string, imageId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      images: section.images.filter((image) => image.id !== imageId),
    }));
  };

  const updateImage = (
    sectionId: string,
    imageId: string,
    updater: (image: GalleryImage) => GalleryImage
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      images: section.images.map((image) =>
        image.id === imageId ? updater(image) : image
      ),
    }));
  };

  const moveImage = (
    sectionId: string,
    imageId: string,
    direction: number
  ) => {
    updateSection(sectionId, (section) => {
      const index = section.images.findIndex((image) => image.id === imageId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= section.images.length) {
        return section;
      }
      const nextImages = [...section.images];
      const [removed] = nextImages.splice(index, 1);
      nextImages.splice(targetIndex, 0, removed);
      return { ...section, images: nextImages };
    });
  };

  const updateSocial = (
    socialId: string,
    updater: (social: SocialLink) => SocialLink
  ) => {
    updateData({
      ...data,
      socials: data.socials.map((social) =>
        social.id === socialId ? updater(social) : social
      ),
    });
  };

  const addSocial = () => {
    if (!newSocial.label.trim() || !newSocial.url.trim()) {
      return;
    }
    const social: SocialLink = {
      id: `social-${Date.now()}`,
      label: newSocial.label,
      url: newSocial.url,
      icon: newSocial.icon,
    };
    updateData({ ...data, socials: [...data.socials, social] });
    setNewSocial({ label: "", url: "", icon: "✨" });
  };

  const removeSocial = (socialId: string) => {
    updateData({
      ...data,
      socials: data.socials.filter((social) => social.id !== socialId),
    });
  };

  const updateContactLink = (
    linkId: string,
    updater: (link: SocialLink) => SocialLink
  ) => {
    updateData({
      ...data,
      contactLinks: data.contactLinks.map((link) =>
        link.id === linkId ? updater(link) : link
      ),
    });
  };

  const addContactLink = () => {
    if (!newContactLink.label.trim() || !newContactLink.url.trim()) {
      return;
    }
    const link: SocialLink = {
      id: `contact-${Date.now()}`,
      label: newContactLink.label,
      url: newContactLink.url,
      icon: newContactLink.icon,
    };
    updateData({
      ...data,
      contactLinks: [...data.contactLinks, link],
    });
    setNewContactLink({ label: "", url: "", icon: "✉️" });
  };

  const removeContactLink = (linkId: string) => {
    updateData({
      ...data,
      contactLinks: data.contactLinks.filter((link) => link.id !== linkId),
    });
  };

  const resetToDefaults = () => {
    clearSiteData();
    updateData(defaultSiteData);
  };

  if (!isAuthed) {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div>
          <h1 className="text-2xl font-semibold">Admin access</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This page is hidden from the main navigation. Use the access code to
            manage the portfolio content.
          </p>
        </div>
        <div className="space-y-3">
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
            type="password"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="Enter access code"
          />
          <button
            className="w-full rounded-2xl bg-[var(--button-bg)] px-4 py-3 text-sm font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={handleLogin}
          >
            Enter admin
          </button>
          <p className="text-xs text-[var(--muted)]">
            Default code: <span className="font-semibold">artist-admin</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage landing highlights, portfolio sections, and page copy.
          </p>
          {uploadMessage ? (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              {uploadMessage}
            </p>
          ) : null}
          {saveMessage ? (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              {saveMessage}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold">Featured images</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {featuredCount} images highlighted on the landing carousel.
          </p>
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Artist name
          </label>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
            value={artistDraft.name}
            onChange={(event) =>
              setArtistDraft((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Artist tagline
          </label>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
            value={artistDraft.tagline}
            onChange={(event) =>
              setArtistDraft((prev) => ({ ...prev, tagline: event.target.value }))
            }
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
              onClick={() => {
                if (!window.confirm("Save artist details changes?")) return;
                updateData({
                  ...data,
                  artist: {
                    ...data.artist,
                    name: artistDraft.name,
                    tagline: artistDraft.tagline,
                  },
                });
                setSaveMessage("Artist details saved.");
              }}
            >
              Save artist details
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold"
              onClick={() =>
                setArtistDraft({
                  name: data.artist.name,
                  tagline: data.artist.tagline,
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Portfolio intro title
          </label>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
            value={portfolioDraft.title}
            onChange={(event) =>
              setPortfolioDraft((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Portfolio intro description
          </label>
          <textarea
            className="h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
            value={portfolioDraft.description}
            onChange={(event) =>
              setPortfolioDraft((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
              onClick={() => {
                if (!window.confirm("Save portfolio intro changes?")) return;
                updateData({
                  ...data,
                  portfolioIntro: {
                    title: portfolioDraft.title,
                    description: portfolioDraft.description,
                  },
                });
                setSaveMessage("Portfolio intro saved.");
              }}
            >
              Save portfolio intro
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold"
              onClick={() =>
                setPortfolioDraft({
                  title: data.portfolioIntro.title,
                  description: data.portfolioIntro.description,
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">Color scheme</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(data.theme).map(([key, value]) => (
            <label key={key} className="space-y-2 text-sm font-medium">
              <span className="capitalize text-[var(--muted)]">{key}</span>
              <div className="flex items-center gap-3">
                <input
                  className="h-10 w-10 overflow-hidden rounded-full border border-[var(--border)]"
                  type="color"
                  value={value}
                  onChange={(event) =>
                    updateData({
                      ...data,
                      theme: { ...data.theme, [key]: event.target.value },
                    })
                  }
                />
                <input
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                  value={value}
                  onChange={(event) =>
                    updateData({
                      ...data,
                      theme: { ...data.theme, [key]: event.target.value },
                    })
                  }
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Portfolio sections</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {data.sections.length} sections
          </span>
        </div>
        <div className="space-y-6">
          {data.sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold"
                    value={sectionDrafts[section.id]?.title ?? section.title}
                    onChange={(event) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: {
                          title: event.target.value,
                          description:
                            prev[section.id]?.description ?? section.description,
                        },
                      }))
                    }
                  />
                  <textarea
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                    value={
                      sectionDrafts[section.id]?.description ?? section.description
                    }
                    onChange={(event) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: {
                          title: prev[section.id]?.title ?? section.title,
                          description: event.target.value,
                        },
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-[var(--button-bg)] px-3 py-1 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
                      onClick={() => {
                        if (!window.confirm("Save section text changes?")) return;
                        const draft = sectionDrafts[section.id];
                        if (!draft) return;
                        updateSection(section.id, (current) => ({
                          ...current,
                          title: draft.title,
                          description: draft.description,
                        }));
                        setSaveMessage("Section text saved.");
                      }}
                    >
                      Save text
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs"
                      onClick={() =>
                        setSectionDrafts((prev) => ({
                          ...prev,
                          [section.id]: {
                            title: section.title,
                            description: section.description,
                          },
                        }))
                      }
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs"
                    onClick={() => moveSection(index, -1)}
                  >
                    Move up
                  </button>
                  <button
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs"
                    onClick={() => moveSection(index, 1)}
                  >
                    Move down
                  </button>
                  <button
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-red-300"
                    onClick={() => {
                      if (!window.confirm("Delete this section and its images?")) {
                        return;
                      }
                      removeSection(section.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Cover image URL
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={section.coverImage}
                  onChange={(event) =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      coverImage: event.target.value,
                    }))
                  }
                />
                <label className="mt-3 block text-xs text-[var(--muted)]">
                  Upload cover image
                </label>
                <label className="mt-2 flex cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] hover:bg-[var(--card)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                  Upload file
                  <input
                    className="sr-only hidden"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await uploadFile(file);
                      updateSection(section.id, (current) => ({
                        ...current,
                        coverImage: dataUrl,
                      }));
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.images.map((image) => (
                  <div
                    key={image.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{image.alt}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                          onClick={() => moveImage(section.id, image.id, -1)}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                          onClick={() => moveImage(section.id, image.id, 1)}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                          onClick={() => removeImage(section.id, image.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                      value={image.src}
                      onChange={(event) =>
                        updateImage(section.id, image.id, (current) => ({
                          ...current,
                          src: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                      value={image.alt}
                      onChange={(event) =>
                        updateImage(section.id, image.id, (current) => ({
                          ...current,
                          alt: event.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                      placeholder="Description"
                      value={image.description}
                      onChange={(event) =>
                        updateImage(section.id, image.id, (current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                    <label className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                      <input
                        type="checkbox"
                        checked={image.highlighted}
                        onChange={(event) =>
                          updateImage(section.id, image.id, (current) => ({
                            ...current,
                            highlighted: event.target.checked,
                          }))
                        }
                      />
                      Highlight on landing page
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-semibold">Add image</h3>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                  placeholder="Image URL"
                  value={newImageDrafts[section.id]?.src || ""}
                  onChange={(event) =>
                    setNewImageDrafts((prev) => ({
                      ...prev,
                      [section.id]: {
                        src: event.target.value,
                        alt: prev[section.id]?.alt || "",
                        description: prev[section.id]?.description || "",
                        highlighted: prev[section.id]?.highlighted || false,
                      },
                    }))
                  }
                />
                <label className="text-xs text-[var(--muted)]">
                  Or upload image
                </label>
                <label className="flex cursor-pointer items-center justify-center rounded-full border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] hover:bg-[var(--card)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                  Upload file
                  <input
                    className="sr-only hidden"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await uploadFile(file);
                      setNewImageDrafts((prev) => ({
                        ...prev,
                        [section.id]: {
                          src: dataUrl,
                          alt: prev[section.id]?.alt || "",
                          description: prev[section.id]?.description || "",
                          highlighted: prev[section.id]?.highlighted || false,
                        },
                      }));
                      event.target.value = "";
                    }}
                  />
                </label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                  placeholder="Alt text"
                  value={newImageDrafts[section.id]?.alt || ""}
                  onChange={(event) =>
                    setNewImageDrafts((prev) => ({
                      ...prev,
                      [section.id]: {
                        src: prev[section.id]?.src || "",
                        alt: event.target.value,
                        description: prev[section.id]?.description || "",
                        highlighted: prev[section.id]?.highlighted || false,
                      },
                    }))
                  }
                />
                <textarea
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                  placeholder="Description"
                  value={newImageDrafts[section.id]?.description || ""}
                  onChange={(event) =>
                    setNewImageDrafts((prev) => ({
                      ...prev,
                      [section.id]: {
                        src: prev[section.id]?.src || "",
                        alt: prev[section.id]?.alt || "",
                        description: event.target.value,
                        highlighted: prev[section.id]?.highlighted || false,
                      },
                    }))
                  }
                />
                <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={newImageDrafts[section.id]?.highlighted || false}
                    onChange={(event) =>
                      setNewImageDrafts((prev) => ({
                        ...prev,
                        [section.id]: {
                          src: prev[section.id]?.src || "",
                          alt: prev[section.id]?.alt || "",
                          description: prev[section.id]?.description || "",
                          highlighted: event.target.checked,
                        },
                      }))
                    }
                  />
                  Highlight this image
                </label>
                <button
                  className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
                  onClick={() => addImage(section.id)}
                >
                  Add image
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-5">
          <h3 className="text-sm font-semibold">Add new section</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Section title"
              value={newSection.title}
              onChange={(event) =>
                setNewSection((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Cover image URL"
              value={newSection.coverImage}
              onChange={(event) =>
                setNewSection((prev) => ({
                  ...prev,
                  coverImage: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Short description"
              value={newSection.description}
              onChange={(event) =>
                setNewSection((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <button
            className="mt-4 rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={addSection}
          >
            Add section
          </button>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">About page</h2>
          <p className="text-sm text-[var(--muted)]">
            HTML is allowed. Pasting stays plain text.
          </p>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              About title
            </label>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
              value={pageCopyDraft.aboutTitle}
              onChange={(event) =>
                setPageCopyDraft((prev) => ({
                  ...prev,
                  aboutTitle: event.target.value,
                }))
              }
            />
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              About description
            </label>
            <textarea
              className="min-h-[90px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
              value={pageCopyDraft.aboutDescription}
              onChange={(event) =>
                setPageCopyDraft((prev) => ({
                  ...prev,
                  aboutDescription: event.target.value,
                }))
              }
            />
          </div>
          <textarea
            className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm"
            value={bioDraft}
            onChange={(event) => setBioDraft(event.target.value)}
          />
          <button
            type="button"
            className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={() => {
              if (!window.confirm("Save About page changes?")) return;
              updateData({
                ...data,
                pageCopy: {
                  ...data.pageCopy,
                  aboutTitle: pageCopyDraft.aboutTitle,
                  aboutDescription: pageCopyDraft.aboutDescription,
                },
                artist: { ...data.artist, bioHtml: bioDraft },
              });
              setSaveMessage("About copy saved.");
            }}
          >
            Save About copy
          </button>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Contact page</h2>
          <p className="text-sm text-[var(--muted)]">
            HTML is allowed. Pasting stays plain text.
          </p>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Contact title
            </label>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm"
              value={pageCopyDraft.contactTitle}
              onChange={(event) =>
                setPageCopyDraft((prev) => ({
                  ...prev,
                  contactTitle: event.target.value,
                }))
              }
            />
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Contact description
            </label>
            <textarea
              className="min-h-[90px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
              value={pageCopyDraft.contactDescription}
              onChange={(event) =>
                setPageCopyDraft((prev) => ({
                  ...prev,
                  contactDescription: event.target.value,
                }))
              }
            />
          </div>
          <textarea
            className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm"
            value={contactDraft}
            onChange={(event) => setContactDraft(event.target.value)}
          />
          <button
            type="button"
            className="rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={() => {
              if (!window.confirm("Save Contact page changes?")) return;
              updateData({
                ...data,
                pageCopy: {
                  ...data.pageCopy,
                  contactTitle: pageCopyDraft.contactTitle,
                  contactDescription: pageCopyDraft.contactDescription,
                },
                artist: { ...data.artist, contactHtml: contactDraft },
              });
              setSaveMessage("Contact copy saved.");
            }}
          >
            Save Contact copy
          </button>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Social links</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {data.socials.length} links
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.socials.map((social) => (
            <div
              key={social.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between">
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={social.label}
                  onChange={(event) =>
                    updateSocial(social.id, (current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                />
                <button
                  className="ml-3 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                  onClick={() => removeSocial(social.id)}
                >
                  Remove
                </button>
              </div>
              <input
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={social.url}
                onChange={(event) =>
                  updateSocial(social.id, (current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
              />
              <input
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={social.icon}
                onChange={(event) =>
                  updateSocial(social.id, (current) => ({
                    ...current,
                    icon: event.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
          <h3 className="text-sm font-semibold">Add new social link</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Label"
              value={newSocial.label}
              onChange={(event) =>
                setNewSocial((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="URL"
              value={newSocial.url}
              onChange={(event) =>
                setNewSocial((prev) => ({
                  ...prev,
                  url: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Icon (emoji or text)"
              value={newSocial.icon}
              onChange={(event) =>
                setNewSocial((prev) => ({
                  ...prev,
                  icon: event.target.value,
                }))
              }
            />
          </div>
          <button
            className="mt-4 rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={addSocial}
          >
            Add social link
          </button>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contact links</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {data.contactLinks.length} links
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.contactLinks.map((link) => (
            <div
              key={link.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between">
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={link.label}
                  onChange={(event) =>
                    updateContactLink(link.id, (current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                />
                <button
                  className="ml-3 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                  onClick={() => removeContactLink(link.id)}
                >
                  Remove
                </button>
              </div>
              <input
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={link.url}
                onChange={(event) =>
                  updateContactLink(link.id, (current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
              />
              <input
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={link.icon}
                onChange={(event) =>
                  updateContactLink(link.id, (current) => ({
                    ...current,
                    icon: event.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
          <h3 className="text-sm font-semibold">Add new contact link</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Label"
              value={newContactLink.label}
              onChange={(event) =>
                setNewContactLink((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="URL or mailto:"
              value={newContactLink.url}
              onChange={(event) =>
                setNewContactLink((prev) => ({
                  ...prev,
                  url: event.target.value,
                }))
              }
            />
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              placeholder="Icon (emoji or text)"
              value={newContactLink.icon}
              onChange={(event) =>
                setNewContactLink((prev) => ({
                  ...prev,
                  icon: event.target.value,
                }))
              }
            />
          </div>
          <button
            className="mt-4 rounded-full bg-[var(--button-bg)] px-4 py-2 text-xs font-semibold text-[var(--button-fg)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-fg)]"
            onClick={addContactLink}
          >
            Add contact link
          </button>
        </div>
      </section>
    </div>
  );
}
