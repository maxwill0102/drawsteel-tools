/**
 * Single source of truth for absolute URLs and social-card meta.
 * When the site moves to its own domain, change SITE_URL here plus the
 * hardcoded host in public/robots.txt and public/sitemap.xml.
 */
export const SITE_URL = "https://drawsteel-tools.vercel.app";
export const SITE_NAME = "Draw Steel Tools";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function canonical(path: string) {
  return `${SITE_URL}${path}`;
}

type PageMeta = {
  title: string;
  description: string;
  /** Path starting with "/" used for canonical + og:url */
  path: string;
};

/**
 * Full meta set for a page: title, description, self-referencing canonical,
 * Open Graph and Twitter card tags.
 */
export function pageMeta({ title, description, path }: PageMeta) {
  const url = canonical(path);
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    // WebSite schema on every page (React Router only renders script:ld+json
    // from the deepest route, so it cannot live in root meta)
    jsonLd(websiteJsonLd),
  ];
}

/** JSON-LD descriptor usable inside a route's meta() export. */
export function jsonLd(data: Record<string, unknown>) {
  return { "script:ld+json": data };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description:
    "Free tools for Draw Steel directors: encounter builder, EV calculator, VTT battle table and dice roller.",
};
