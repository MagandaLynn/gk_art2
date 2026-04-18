export type SiteTheme = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  card: string;
  border: string;
  buttonBg: string;
  buttonFg: string;
  buttonHoverBg: string;
  buttonHoverFg: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  description: string;
  highlighted: boolean;
};

export type PortfolioSection = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  images: GalleryImage[];
};

export type SiteData = {
  artist: {
    name: string;
    tagline: string;
    bioHtml: string;
    contactHtml: string;
  };
  contactLinks: SocialLink[];
  pageCopy: {
    aboutTitle: string;
    aboutDescription: string;
    contactTitle: string;
    contactDescription: string;
  };
  portfolioIntro: {
    title: string;
    description: string;
  };
  theme: SiteTheme;
  socials: SocialLink[];
  sections: PortfolioSection[];
};

export const defaultSiteData: SiteData = {
  artist: {
    name: "Gerard Knapp",
    tagline: "",
    bioHtml:
      "Gerard is a multidisciplinary artist based in Portland. Their practice blends analog photography with mixed media to capture fleeting moments and soft narratives.\n\nUse the admin panel to update this bio with your own story.",
    contactHtml:
      "For commissions, exhibitions, or collaborations, please reach out. This section can include booking details, studio hours, or a contact email.",
  },
  contactLinks: [
    {
      id: "contact-1",
      label: "Email",
      url: "mailto:hello@example.com",
      icon: "✉️",
    },
  ],
  pageCopy: {
    aboutTitle: "About",
    aboutDescription: "Artist statement",
    contactTitle: "Contact",
    contactDescription: "Let’s plan collaborations, commissions, and exhibitions.",
  },
  portfolioIntro: {
    title: "Portfolio",
    description:
      "A curated selection of recent work. Each section represents a series or exhibition concept.",
  },
  theme: {
    background: "#0f0f10",
    foreground: "#f5f5f3",
    accent: "#c7c7c2",
    muted: "#a1a1a1",
    card: "#161618",
    border: "#2a2a2e",
    buttonBg: "#f5f5f3",
    buttonFg: "#0f0f10",
    buttonHoverBg: "#c7c7c2",
    buttonHoverFg: "#0f0f10",
  },
  socials: [
    {
      id: "social-1",
      label: "Instagram",
      url: "https://instagram.com/",
      icon: "📷",
    },
    {
      id: "social-2",
      label: "YouTube",
      url: "https://youtube.com/",
      icon: "▶️",
    },
  ],
  sections: [
    {
      id: "section-1",
      title: "Drift Studies",
      description: "Soft gradients and minimal forms inspired by coastal mornings.",
      coverImage: "/portfolio-1.svg",
      images: [
        {
          id: "img-1",
          src: "/portfolio-1.svg",
          alt: "Drift Studies in warm haze",
          description: "",
          highlighted: true,
        },
        {
          id: "img-2",
          src: "/portfolio-2.svg",
          alt: "Drift Studies in cool light",
          description: "",
          highlighted: false,
        },
        {
          id: "img-3",
          src: "/portfolio-3.svg",
          alt: "Drift Studies in twilight",
          description: "",
          highlighted: true,
        },
      ],
    },
    {
      id: "section-2",
      title: "Studio Notes",
      description: "Texture-forward works exploring paper, ink, and natural pigments.",
      coverImage: "/portfolio-4.svg",
      images: [
        {
          id: "img-4",
          src: "/portfolio-4.svg",
          alt: "Studio Notes in ochre",
          description: "",
          highlighted: false,
        },
        {
          id: "img-5",
          src: "/portfolio-5.svg",
          alt: "Studio Notes in graphite",
          description: "",
          highlighted: false,
        },
        {
          id: "img-6",
          src: "/portfolio-6.svg",
          alt: "Studio Notes in dusk",
          description: "",
          highlighted: true,
        },
      ],
    },
  ],
};
